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
import { passkey } from '@better-auth/passkey';
import { stripe } from '@better-auth/stripe';
import Stripe from 'stripe';

import { prismaAdapter } from 'better-auth/adapters/prisma';

import prisma from '../prisma/prisma.service';

type AuthInstance = ReturnType<typeof betterAuth>;

// Load Stripe API key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripeClient = new Stripe(stripeSecretKey, {
  apiVersion: '2025-11-17.clover', // Latest API version as of Stripe SDK v19
});

// Load Google OAuth credentials from environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required',
  );
}

export const auth: AuthInstance = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    transaction: true,
    // debugLogs: true,
  }),
  experimental: {
    joins: true,
  },
  logger: {
    level: 'error',
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // const organization = await getActiveOrganization(session.userId);
          return Promise.resolve({
            data: {
              ...session,
              activeOrganizationId: '',
            },
          });
        },
      },
    },
  },
  // npx @better-auth/cli@latest generate
  appName: 'Server',
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
    }),
    openAPI(),
    multiSession(),
    oneTimeToken(),
    lastLoginMethod(),
    admin(),
    organization({
      teams: { enabled: true },
    }),
    twoFactor(),
    passkey(),
  ],

  trustedOrigins: ['http://localhost:3001', 'http://localhost:4000'],
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      scope: ['https://www.googleapis.com/auth/drive.file'],
      accessType: 'offline',
      prompt: 'select_account consent',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
