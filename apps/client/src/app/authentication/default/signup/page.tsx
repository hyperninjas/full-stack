'use client';

import { authClient } from 'lib/auth-client';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const Page = () => {
  const handleSignup = async (data: { name: string; email: string; password: string }) => {
   
    try {
      const response = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  return <SignupForm handleSignup={handleSignup} socialAuth={false} />;
};

export default Page;
