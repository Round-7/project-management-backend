import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { success } from '../utils'
import { prisma } from '../config'
import { logger } from '../utils/logger'
import type { HealthInfo } from '../types'
import { HealthResponseSchema } from '../schemas'

// 创建路由处理器
const healthRouter = new OpenAPIHono()

// 健康检查API - OpenAPI定义
healthRouter.openapi(
  createRoute({
    method: 'get',
    path: '',
    tags: ['系统'],
    summary: '健康检查',
    description: '获取系统健康状态和关键组件信息',
    responses: {
      200: {
        description: '系统健康状态',
        content: {
          'application/json': {
            schema: HealthResponseSchema
          }
        }
      }
    }
  }),
  async c => {
    // 获取Node.js版本
    const nodeVersion = process.version

    // 获取数据库信息
    let dbErr = null
    let dbInfo = null

    try {
      dbInfo = await prisma.$queryRaw`SELECT version() as version`
    } catch (err) {
      dbErr = err
      logger.error('获取数据库信息失败:', err)
    }

    // 获取应用版本
    const appVersion = process.env.APP_VERSION || 'v1.0.0'

    // 构建健康状态响应
    const healthInfo: HealthInfo = {
      status: 'ok',
      version: appVersion,
      timestamp: new Date().toISOString(),
      nodeVersion,
      database: {
        connected: !dbErr,
        type: 'PostgreSQL',
        version: dbErr
          ? 'Unknown'
          : (dbInfo as { version: string }[])[0]?.version || 'Unknown'
      },
      uptime: process.uptime()
    }

    return success(c, '系统正常', healthInfo)
  }
)

export default healthRouter
