import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  integrations: {
    apiFootballKey: process.env.API_FOOTBALL_KEY ?? '',
    chatbotCliProxyUrl: process.env.CHATBOT_CLI_PROXY_URL ?? '',
  },
} as const;

export const isProd = env.nodeEnv === 'production';
