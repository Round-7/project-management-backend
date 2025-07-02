import { Hono } from 'hono'
import { corsMiddleware } from './middlewares'
import router from './routes'
import { APP_URL, APP_PORT } from './config'
import { logger } from './utils/logger'

// 创建Hono应用
const app = new Hono()

// 配置CORS
app.use(corsMiddleware)

// 注册路由
app.route('/', router)

// API根路由，提供API信息
app.get('/', c => c.redirect('/api/docs'))

// 启动服务器
logger.info(`服务器正在运行: ${APP_URL}:${APP_PORT}`)
logger.info(`API文档地址: ${APP_URL}:${APP_PORT}/api/docs`)

export default {
  port: APP_PORT,
  fetch: app.fetch
}
