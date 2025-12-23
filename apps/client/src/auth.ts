import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import { twoFactorClient } from 'better-auth/client/plugins';
import { multiSessionClient } from 'better-auth/client/plugins';
import { oneTimeTokenClient } from 'better-auth/client/plugins';
import { lastLoginMethodClient } from 'better-auth/client/plugins';
import { adminClient } from 'better-auth/client/plugins';
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    passkeyClient(),
    multiSessionClient(),
    oneTimeTokenClient(),
    lastLoginMethodClient(),
    adminClient(),
    organizationClient(),
  ],
});
