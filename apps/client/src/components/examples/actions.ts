'use server';

import { createServerApi, revalidateApiCache } from '@/api/server';
import { HealthApi } from '@/api';

export async function checkHealthAction() {
  const healthApi = await createServerApi(HealthApi);
  const health = await healthApi.healthControllerCheck();

  // Revalidate the cache
  revalidateApiCache('health');

  return health;
}
