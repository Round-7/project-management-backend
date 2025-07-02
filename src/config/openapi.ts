import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import {
  projectSchema,
  createProjectSchema,
  searchParamsSchema
} from '../schemas/project'
import { ResponseCode, ResponseStatus } from '../types/response'

// Create OpenAPI instance
export const openAPIHono = new OpenAPIHono()

// Define schema objects for responses
export const ErrorResponseSchema = z.object({
  code: z.nativeEnum(ResponseCode),
  message: z.string(),
  data: z.null(),
  timestamp: z.number()
})

export const SuccessResponseSchema = z.object({
  code: z.literal(ResponseCode.SUCCESS),
  message: z.string(),
  data: z.any(),
  timestamp: z.number()
})

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

export const ProjectResponseSchema = SuccessResponseSchema.extend({
  data: projectSchema
})

export const ProjectListResponseSchema = PaginatedResponseSchema.extend({
  data: z.object({
    list: z.array(projectSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
  })
})

export const ImportResultResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    successCount: z.number(),
    failCount: z.number()
  })
})

// Define OpenAPI document
export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: '业务演示系统 API',
    version: '1.0.0',
    description: '业务演示系统 API 文档'
  },
  servers: [
    {
      url: '/api',
      description: 'API服务器'
    }
  ],
  tags: [
    {
      name: '项目管理',
      description: '项目相关的API'
    },
    {
      name: '系统',
      description: '系统相关的API'
    }
  ],
  paths: {},
  components: {
    schemas: {}
  }
}
