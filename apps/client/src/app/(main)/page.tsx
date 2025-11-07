import { headers } from 'next/headers';
import { authClient } from '@/auth';
import ApiTest from 'components/ApiTest';

const Page = async () => {
  const cookieHeader = await headers();
  const session = await authClient.getSession({
    fetchOptions: { headers: { cookie: cookieHeader.get('cookie') ?? '' } },
  });

  console.log(session);

  return (
    <div>
      {JSON.stringify(session)}

      <ApiTest />
    </div>
  );
};

export default Page;
