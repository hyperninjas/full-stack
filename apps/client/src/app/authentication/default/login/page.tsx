'use client';

import LoginForm from 'components/sections/authentications/default/LoginForm';
import paths, { rootPaths } from 'routes/paths';
import { authClient } from 'lib/auth-client';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter()
  const handleLogin = async (data: { email: string; password: string , rememberDevice: boolean }) => {
   try {
    const response = await authClient.signIn.email(data)
    return response

   } catch (error) {
    return error
   }
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.signup}
      forgotPasswordLink={paths.forgotPassword}
      socialAuth={false}
      rememberDevice={true}
    />
  );
};

export default Page;
