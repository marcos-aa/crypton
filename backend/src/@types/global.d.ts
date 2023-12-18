namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    JWT_EXPIRY: string
    JWT_EXPIRY_REF: string
    JWT_SECRET: string
    JWT_SECRET_REF: string
    MAX_REFRESH: number
    MAX_ACCESS: number
    MOCK_ID: string
    MOCK_MAIL: string
    MOCK_MAIL_UP: string
    MOCK_PASS: string
    OAUTH_CLIENTID: string
    OAUTH_CLIENT_SECRET: string
    OAUTH_MAIL: string
    OAUTH_PASSWORD: string
    OAUTH_REFRESH: string
    PORT: number
    TEST_ENV: string
  }
}
