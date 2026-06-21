import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  app: {
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  auth: {
    resetTokenTtlMinutes: Number(process.env.RESET_TOKEN_TTL_MINUTES ?? 60),
  },
  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'no-reply@football-lover.local',
  },
  integrations: {
    apiFootballKey: process.env.API_FOOTBALL_KEY ?? '',
    chatbotCliProxyUrl: process.env.CHATBOT_CLI_PROXY_URL ?? '',
  },
} as const;

export const isProd = env.nodeEnv === 'production';
