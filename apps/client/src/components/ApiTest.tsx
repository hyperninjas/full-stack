'use client';
import { useEffect, useState } from 'react';
import { Configuration, HealthApi, HealthControllerCheck200Response } from '@/api';

export default function ApiTest() {
  const [health, setHealth] = useState<HealthControllerCheck200Response>();
  useEffect(() => {
    (async () => {
      const config = new Configuration({
        basePath: 'http://localhost:4000',
        credentials: 'include',
      });
      const api = new HealthApi(config);

      const health = await api.healthControllerCheck();
      setHealth(health);
    })();
  }, []);

  return <div>{JSON.stringify(health, null, 2)}</div>;
}
