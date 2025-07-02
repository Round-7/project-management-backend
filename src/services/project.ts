import { prisma } from '../config'
import { clearCache } from '../utils/cache'
import { logger } from '../utils/logger'
import to from 'await-to-js'
import type {
  PaginatedResponseData,
  Project,
  ProjectCreateData,
  ProjectSearchParams,
  ProjectStats
} from '../types'

export const importProjectData = async (
  data: ProjectCreateData[]
): Promise<{ successCount: number; failCount: number }> => {
  let successCount = 0
  let failCount = 0

  // 批量保存数据，处理冲突
  for (const item of data) {
    // 检查是否已存在相同名称的项目
    const [findErr, existingProject] = await to(
      prisma.project.findFirst({
        where: { name: item.name }
      })
    )

    if (findErr) {
      logger.error('查询数据失败:', findErr)
      failCount++
      continue
    }

    if (existingProject) {
      // 如果已存在，则跳过
      continue
    }

    // 创建新项目
    const [createErr] = await to(
      prisma.project.create({
        data: {
          name: item.name
        }
      })
    )

    if (createErr) {
      logger.error('导入数据失败:', createErr)
      failCount++
    } else {
      successCount++
    }
  }

  // 清除所有相关缓存
  const [cacheErr] = await to(clearCache('project:*'))
  if (cacheErr) {
    logger.error('清除缓存失败:', cacheErr)
  }

  return { successCount, failCount }
}

export const getProjects = async (
  params: ProjectSearchParams
): Promise<PaginatedResponseData<Project>> => {
  const { query, page, limit, sortBy, sortOrder } = params

  // 构建查询条件
  const where = query
    ? {
        name: {
          contains: query
        }
      }
    : {}

  // 计算总数
  const [countErr, totalCount] = await to<number>(
    prisma.project.count({
      where
    })
  )
  if (countErr) {
    logger.error('获取数据总数失败:', countErr)
    throw countErr
  }

  // 构建排序
  const orderBy: Record<string, string> = {}
  if (sortBy) {
    orderBy[sortBy] = sortOrder || 'asc'
  } else {
    orderBy['createdAt'] = 'desc'
  }

  // 获取分页数据
  const [findErr, projectsData] = await to<Project[]>(
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })
  )

  if (findErr) {
    logger.error('获取分页数据失败:', findErr)
    throw findErr
  }

  return {
    list: projectsData,
    total: totalCount,
    page,
    limit
  }
}

export const getProjectById = async (id: string): Promise<Project | null> => {
  const [err, projectData] = await to(
    prisma.project.findUnique({
      where: { id }
    })
  )

  if (err) {
    logger.error('获取项目详情失败:', err)
    throw err
  }

  const project = projectData as Project | null
  return project
}

/**
 * 获取项目统计数据
 * @returns 项目统计数据
 */
export const getProjectStats = async (): Promise<ProjectStats> => {
  // 获取项目总数
  const [totalErr, totalCount] = await to<number>(prisma.project.count())

  if (totalErr) {
    logger.error('获取项目总数失败:', totalErr)
    throw totalErr
  }

  // 获取一周前的日期
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // 获取本周新增项目数
  const [weeklyNewErr, weeklyNewCount] = await to<number>(
    prisma.project.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })
  )

  if (weeklyNewErr) {
    logger.error('获取本周新增项目数失败:', weeklyNewErr)
    throw weeklyNewErr
  }

  // 获取最近更新的项目数
  const [recentlyUpdatedErr, recentlyUpdatedCount] = await to<number>(
    prisma.project.count({
      where: {
        updatedAt: {
          gte: oneWeekAgo
        }
      }
    })
  )

  if (recentlyUpdatedErr) {
    logger.error('获取最近更新项目数失败:', recentlyUpdatedErr)
    throw recentlyUpdatedErr
  }

  return {
    totalCount,
    weeklyNewCount,
    recentlyUpdatedCount
  }
}
