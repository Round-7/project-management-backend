import { redisClient } from '../config'

// 创建缓存键
export const createCacheKey = (
  query: string,
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: string
): string => {
  return `project:${query || 'all'}:${page}:${limit}:${
    sortBy || 'default'
  }:${sortOrder || 'asc'}`
}

// 缓存数据
export const cacheData = async <T>(
  key: string,
  data: T,
  expirationSeconds = 60
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: expirationSeconds
  })
}

// 获取缓存数据
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redisClient.get(key)
  if (!cachedData) return null
  return JSON.parse(cachedData) as T
}

// 清除缓存
export const clearCache = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern)
  if (keys.length > 0) {
    await redisClient.del(keys)
  }
}
