import { Hono } from 'hono'
import projectRouter from './project'
import healthRouter from './health'
import apiDocsRouter, { createOpenAPIDocument } from './openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'

const router = new Hono()

// 项目相关API
router.route('/api/projects', projectRouter)

// 健康检查API
router.route('/api/health', healthRouter)

// 创建OpenAPI文档JSON
router.get('/api/docs/json', c => {
  // 创建一个新的OpenAPIHono实例用于合并API路由
  const combinedRouter = new OpenAPIHono()

  // 手动将项目路由和健康检查路由添加到combinedRouter
  combinedRouter.route('/projects', projectRouter)
  combinedRouter.route('/health', healthRouter)

  return c.json(createOpenAPIDocument(combinedRouter))
})

// API文档
router.route('/api/docs', apiDocsRouter)

export default router
