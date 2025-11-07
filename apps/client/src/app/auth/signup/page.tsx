'use client';

import { authClient } from '@/auth';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const Page = () => {
  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    const { data: loginData, error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    console.log(loginData, error);
  };

  return <SignupForm handleSignup={handleSignup} socialAuth />;
};

export default Page;
