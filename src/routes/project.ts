import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import {
  processExcelFile,
  importProjectData,
  getProjects,
  getProjectById,
  getProjectStats,
  exportProjectsToExcel
} from '../services'
import { createCacheKey, cacheData, getCachedData } from '../utils/cache'
import { logger } from '../utils/logger'
import to from 'await-to-js'
import { success, paginate, badRequest, notFound, serverError } from '../utils'
import {
  searchParamsSchema,
  projectSchema,
  importFileSchema,
  exportQuerySchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  ProjectResponseSchema,
  ProjectListResponseSchema,
  ImportResultResponseSchema
} from '../schemas'
import type { PaginatedResponseData, Project } from '../types'

// 创建路由处理器
const projectRouter = new OpenAPIHono()

// 导入Excel数据 - OpenAPI定义
projectRouter.openapi(
  createRoute({
    method: 'post',
    path: 'import',
    tags: ['项目管理'],
    summary: '导入Excel项目数据',
    description: '通过上传Excel文件导入项目数据',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: importFileSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: '导入成功',
        content: {
          'application/json': {
            schema: ImportResultResponseSchema
          }
        }
      },
      400: {
        description: '请求错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    try {
      // 获取表单数据
      const formData = await c.req.formData()
      const file = formData.get('file')

      if (!file || !(file instanceof File)) {
        return badRequest(c, '请上传有效的Excel文件')
      }

      // 处理Excel文件
      try {
        const excelResult = await processExcelFile(file)

        // 导入数据
        try {
          const result = await importProjectData(excelResult.data)
          return success(c, '导入成功', result)
        } catch (importErr) {
          logger.error('导入数据失败:', importErr)
          return serverError(c, '导入数据失败')
        }
      } catch (excelErr) {
        logger.error('处理Excel文件失败:', excelErr)
        return serverError(c, '处理Excel文件失败')
      }
    } catch (formErr) {
      logger.error('获取表单数据失败:', formErr)
      return serverError(c, '获取表单数据失败')
    }
  }
)

// 导出项目数据 - OpenAPI定义
projectRouter.openapi(
  createRoute({
    method: 'get',
    path: 'export',
    tags: ['项目管理'],
    summary: '导出项目数据到Excel',
    description: '将项目数据导出为Excel文件',
    request: {
      query: exportQuerySchema
    },
    responses: {
      200: {
        description: '导出成功',
        content: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            schema: z.any().describe('Excel文件')
          }
        }
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    try {
      // 获取查询参数
      const query = c.req.query('query') || ''

      // 导出项目数据
      const excelBuffer = await exportProjectsToExcel(query)

      // 设置响应头
      c.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      c.header(
        'Content-Disposition',
        `attachment; filename=projects-${Date.now()}.xlsx`
      )

      return c.body(excelBuffer)
    } catch (exportErr) {
      logger.error('导出项目数据失败:', exportErr)
      return serverError(c, '导出数据失败')
    }
  }
)

// 获取项目统计数据 - OpenAPI定义
projectRouter.openapi(
  createRoute({
    method: 'get',
    path: 'stats',
    tags: ['项目管理'],
    summary: '获取项目统计数据',
    description: '获取项目相关的统计信息',
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: SuccessResponseSchema
          }
        }
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    try {
      // 获取项目统计数据
      const stats = await getProjectStats()
      return success(c, '获取成功', stats)
    } catch (err) {
      logger.error('获取项目统计数据失败:', err)
      return serverError(c, '获取统计数据失败')
    }
  }
)

// 获取项目数据，支持搜索和分页 - OpenAPI定义
projectRouter.openapi(
  createRoute({
    method: 'get',
    path: '',
    tags: ['项目管理'],
    summary: '获取项目列表',
    description: '分页获取项目列表数据，支持搜索和排序',
    request: {
      query: searchParamsSchema
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: ProjectListResponseSchema
          }
        }
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    const params = c.req.valid('query')

    try {
      // 检查缓存
      const cacheKey = createCacheKey(
        params.query || '',
        params.page,
        params.limit,
        params.sortBy,
        params.sortOrder
      )

      try {
        // 获取缓存数据
        const cachedData =
          await getCachedData<PaginatedResponseData<Project>>(cacheKey)

        if (cachedData) {
          c.header('X-Cache-Hit', 'true')
          return paginate(c, cachedData, '获取成功(缓存)')
        }
      } catch (cacheErr) {
        logger.error('获取缓存数据失败:', cacheErr)
      }

      // 获取项目数据
      const result = await getProjects(params)

      // 缓存结果，60秒过期
      try {
        await cacheData(cacheKey, result)
      } catch (cacheWriteErr) {
        logger.error('缓存数据失败:', cacheWriteErr)
      }

      return paginate(c, result, '获取成功')
    } catch (projectErr) {
      logger.error('获取项目数据失败:', projectErr)
      return serverError(c, '获取数据失败')
    }
  }
)

// 获取单个项目数据 - OpenAPI定义
projectRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['项目管理'],
    summary: '获取项目详情',
    description: '通过ID获取单个项目的详细信息',
    request: {
      params: z.object({
        id: z.string().describe('项目ID')
      })
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: ProjectResponseSchema
          }
        }
      },
      404: {
        description: '项目不存在',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    const id = c.req.param('id')!

    try {
      // 获取项目详情
      const project = await getProjectById(id)

      if (!project) {
        return notFound(c, '未找到数据')
      }

      return success(c, '获取成功', project)
    } catch (err) {
      logger.error('获取项目数据失败:', err)
      return serverError(c, '获取数据失败')
    }
  }
)

export default projectRouter
