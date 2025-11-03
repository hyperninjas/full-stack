import { betterAuth } from 'better-auth';
import {
  admin,
  lastLoginMethod,
  multiSession,
  oneTimeToken,
  openAPI,
  organization,
  twoFactor,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
// import { stripe } from '@better-auth/stripe';
// import Stripe from 'stripe';
// const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-10-29.clover', // Latest API version as of Stripe SDK v19
// });
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './src/prisma/prisma.service';

type AuthInstance = ReturnType<typeof betterAuth>;

export const auth: AuthInstance = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    transaction: true,
    debugLogs: true,
  }),
  trustedOrigins: ['http://localhost:3000'],
  // npx @better-auth/cli@latest generate
  appName: 'Server',
  plugins: [
    // stripe({
    //   stripeClient,
    //   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    //   createCustomerOnSignUp: true,
    // }),
    openAPI(),
    multiSession(),
    oneTimeToken(),
    lastLoginMethod(),
    admin(),
    organization(),
    twoFactor(),
    passkey(),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      accessType: 'offline',
      prompt: 'select_account consent',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
