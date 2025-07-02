export interface Project {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectCreateData {
  name: string
}

export interface ProjectSearchParams {
  query?: string
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 项目统计数据接口
 */
export interface ProjectStats {
  /** 项目总数 */
  totalCount: number
  /** 本周新增项目数 */
  weeklyNewCount: number
  /** 最近一周更新的项目数 */
  recentlyUpdatedCount: number
}
