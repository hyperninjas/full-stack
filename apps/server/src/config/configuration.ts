export type Configuration = {
  port: number;
  env: string;
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  openapi: {
    title: string;
    description: string;
    version: string;
    enabled: boolean;
    outputDir: string;
    filename: string;
  };
  auth: {
    betterAuthSecret: string;
    betterAuthUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };
};

export type DatabaseConfiguration = Configuration['database'];
export type CorsConfiguration = Configuration['cors'];
export type OpenapiConfiguration = Configuration['openapi'];
export type AuthConfiguration = Configuration['auth'];

export default () =>
  ({
    port: parseInt(process.env.PORT!, 10) || 4000,
    env: process.env.NODE_ENV!,
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || [],
      credentials: Boolean(process.env.CORS_CREDENTIALS),
      methods: process.env.CORS_METHODS?.split(',') || [],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || [],
    },
    openapi: {
      title: process.env.OPENAPI_TITLE!,
      description: process.env.OPENAPI_DESCRIPTION!,
      version: process.env.OPENAPI_VERSION!,
      enabled: Boolean(process.env.OPENAPI_ENABLED),
      outputDir: process.env.OPENAPI_OUTPUT_DIR!,
      filename: process.env.OPENAPI_FILENAME!,
    },
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
      host: process.env.DATABASE_HOST!,
      port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
    },
  }) satisfies Configuration;
