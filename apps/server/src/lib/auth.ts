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

const stripeClient = new Stripe('sk_skfl', {
  apiVersion: '2025-11-17.clover', // Latest API version as of Stripe SDK v19
});

export const auth: AuthInstance = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    transaction: true,
    debugLogs: true,
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
      clientId:
        '731592961565-k651r7qts814nhrqltufb89bnmtk5o0n.apps.googleusercontent.com',
      clientSecret: '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',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      accessType: 'offline',
      prompt: 'select_account consent',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
