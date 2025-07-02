import type { Context } from 'hono'
import {
  ResponseCode,
  ResponseStatus,
  type PaginatedResponse,
  type PaginatedResponseData
} from '../types/response'

// 成功响应
export const success = <T>(
  c: Context,
  message: string = '操作成功',
  data?: T
): Response => {
  return c.json(
    {
      code: ResponseCode.SUCCESS,
      message,
      data,
      timestamp: Date.now()
    },
    ResponseStatus.SUCCESS
  )
}

// 分页响应
export const paginate = <T>(
  c: Context,
  data: PaginatedResponseData<T>,
  message: string = '获取成功'
): Response => {
  if (data && data.total !== undefined) {
    c.header('X-Total-Count', String(data.total))
  }
  return c.json<PaginatedResponse<T>>(
    {
      code: ResponseCode.SUCCESS,
      message,
      data,
      timestamp: Date.now()
    },
    ResponseStatus.SUCCESS
  )
}

// 错误响应
export const error = (
  c: Context,
  message: string = '操作失败',
  code: ResponseCode = ResponseCode.FAILED,
  status: ResponseStatus = ResponseStatus.SERVER_ERROR
): Response => {
  return c.json(
    {
      code,
      message,
      timestamp: Date.now()
    },
    status
  )
}

// 400错误响应
export const badRequest = (
  c: Context,
  message: string = '请求参数错误'
): Response => {
  return error(
    c,
    message,
    ResponseCode.VALIDATION_ERROR,
    ResponseStatus.BAD_REQUEST
  )
}

// 401错误响应
export const unauthorized = (
  c: Context,
  message: string = '未授权访问'
): Response => {
  return error(
    c,
    message,
    ResponseCode.UNAUTHORIZED,
    ResponseStatus.UNAUTHORIZED
  )
}

// 403错误响应
export const forbidden = (
  c: Context,
  message: string = '禁止访问'
): Response => {
  return error(c, message, ResponseCode.FORBIDDEN, ResponseStatus.FORBIDDEN)
}

// 404错误响应
export const notFound = (
  c: Context,
  message: string = '资源不存在'
): Response => {
  return error(c, message, ResponseCode.NOT_FOUND, ResponseStatus.NOT_FOUND)
}

// 500错误响应
export const serverError = (
  c: Context,
  message: string = '服务器内部错误'
): Response => {
  return error(
    c,
    message,
    ResponseCode.SERVER_ERROR,
    ResponseStatus.SERVER_ERROR
  )
}
