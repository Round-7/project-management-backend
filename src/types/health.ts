/**
 * 健康检查响应数据接口
 */
export interface HealthInfo {
  /** 系统状态 */
  status: string
  /** 应用版本 */
  version: string
  /** 时间戳 */
  timestamp: string
  /** Node.js版本 */
  nodeVersion: string
  /** 数据库信息 */
  database: {
    /** 是否连接成功 */
    connected: boolean
    /** 数据库类型 */
    type: string
    /** 数据库版本 */
    version: string
  }
  /** 系统运行时间（秒） */
  uptime: number
}
