import { z } from 'zod'
import { ResponseCode } from '../types/response'

// 基础错误响应模式
export const ErrorResponseSchema = z.object({
  code: z.nativeEnum(ResponseCode),
  message: z.string(),
  data: z.null(),
  timestamp: z.number()
})

// 基础成功响应模式
export const SuccessResponseSchema = z.object({
  code: z.literal(ResponseCode.SUCCESS),
  message: z.string(),
  data: z.any(),
  timestamp: z.number()
})

// 分页响应基础模式
export const PaginatedResponseSchema = z.object({
  code: z.literal(ResponseCode.SUCCESS),
  message: z.string(),
  data: z.object({
    list: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    limit: z.number()
  }),
  timestamp: z.number()
})

// 创建类型化的成功响应模式工厂函数
export const createSuccessResponseSchema = <T extends z.ZodType>(
  dataSchema: T
) => {
  return SuccessResponseSchema.extend({
    data: dataSchema
  })
}

// 创建类型化的分页响应模式工厂函数
export const createPaginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T
) => {
  return PaginatedResponseSchema.extend({
    data: z.object({
      list: z.array(itemSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number()
    })
  })
}
