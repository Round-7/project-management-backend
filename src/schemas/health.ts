import { z } from 'zod'
import { createSuccessResponseSchema } from './response'

// 数据库状态模式
export const databaseStatusSchema = z.object({
  connected: z.boolean(),
  type: z.string(),
  version: z.string()
})

// 健康状态信息模式
export const healthInfoSchema = z.object({
  status: z.string(),
  version: z.string(),
  timestamp: z.string(),
  nodeVersion: z.string(),
  database: databaseStatusSchema,
  uptime: z.number()
})

// 健康检查响应模式
export const HealthResponseSchema =
  createSuccessResponseSchema(healthInfoSchema)
