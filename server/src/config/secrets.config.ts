import { registerAs } from '@nestjs/config';

/**
 * Sensitive credentials configuration.
 * NEVER log or expose these values.
 */
export const secretsConfig = registerAs('secrets', () => ({
  auth: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
    betterAuthUrl: process.env.BETTER_AUTH_URL!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  database: {
    url: process.env.DATABASE_URL!,
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
  },
}));

export type SecretsConfig = ReturnType<typeof secretsConfig>;
