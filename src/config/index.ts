export * from './database'
export * from './redis'

export const APP_URL = process.env.APP_URL || 'http://localhost'
export const APP_PORT = Number(process.env.APP_PORT || 3000)
