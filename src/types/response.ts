// 响应状态码
export enum ResponseStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

// 响应代码
export enum ResponseCode {
  SUCCESS = 0,
  FAILED = -1,
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  SERVER_ERROR = 9999
}

// 基础响应格式
export interface BaseResponse<T> {
  code: ResponseCode
  message: string
  data: T
  timestamp: number
}

// 分页响应格式
export interface PaginatedResponseData<T> {
  list: T[]
  total: number
  page: number
  limit: number
}

export interface PaginatedResponse<T>
  extends BaseResponse<PaginatedResponseData<T>> {}
