import { createClient } from 'redis'
import { logger } from '../utils/logger'

// 初始化Redis客户端
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// 连接Redis
redisClient.connect().catch(err => logger.error('Redis连接失败:', err))
