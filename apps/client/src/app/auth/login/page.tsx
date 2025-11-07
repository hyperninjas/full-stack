'use client';

import { useState } from 'react';
import paths from 'routes/paths';
import { authClient } from '@/auth';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Page = () => {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (data: any) => {
    console.log(data);

    const { data: loginData, error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: rememberMe,
    });
    console.log(loginData, error);
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.signup}
      forgotPasswordLink={paths.forgotPassword}
      socialAuth={true}
      rememberDevice={true}
    />
  );
};

export default Page;
