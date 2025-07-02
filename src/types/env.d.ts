export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_VERSION: string
      APP_URL: string
      APP_PORT: string
      DATABASE_URL: string
      REDIS_URL: string
    }
  }
}
