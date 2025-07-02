import { z } from 'zod'
import {
  createPaginatedResponseSchema,
  createSuccessResponseSchema
} from './response'

// 项目模式定义
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
})

// 创建项目数据模式
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: '项目名称不能为空' })
    .max(100, { message: '项目名称不能超过100个字符' })
})

// 导入Excel文件模式
export const importFileSchema = z.object({
  file: z.instanceof(File, { message: '请上传有效的Excel文件' })
})

// 搜索参数模式
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// 项目列表响应模式
export const projectListResponseSchema = z.object({
  data: z.array(projectSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

// 导入结果模式
export const importResultSchema = z.object({
  successCount: z.number(),
  failCount: z.number()
})

// 导出查询参数模式
export const exportQuerySchema = z.object({
  query: z.string().optional().describe('搜索关键字')
})

// 项目详情响应模式
export const ProjectResponseSchema = createSuccessResponseSchema(projectSchema)

// 项目列表分页响应模式
export const ProjectListResponseSchema =
  createPaginatedResponseSchema(projectSchema)

// 导入结果响应模式
export const ImportResultResponseSchema =
  createSuccessResponseSchema(importResultSchema)
