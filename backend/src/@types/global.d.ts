declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    DOMAIN: string
    APP_MAIL: string
    SES_ACCESS: string
    SES_SECRET: string
    SES_REGION: string
    JWT_SECRET: string
    JWT_SECRET_REF: string
    JWT_EXPIRY: string
    JWT_EXPIRY_REF: string
    MAX_REFRESH: string
  }
}
