import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { openApiDocument } from '../config/openapi'

const apiDocsRouter = new Hono()

// 提供SwaggerUI界面
apiDocsRouter.get('/*', swaggerUI({ url: '/api/docs/json' }))

export default apiDocsRouter

// 创建OpenAPI文档生成器
export const createOpenAPIDocument = (app: OpenAPIHono) => {
  return app.getOpenAPIDocument({
    ...openApiDocument
  })
}
