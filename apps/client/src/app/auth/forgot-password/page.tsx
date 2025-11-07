'use client';

import ForgotPasswordForm from 'components/sections/authentications/common/ForgotPasswordForm';
import axiosInstance from 'services/axios/axiosInstance';
import { apiEndpoints } from 'routes/paths';

const Page = () => {
  const handleSendResetLink = async ({ email }: { email: string }) => {
    try {
      const res = await axiosInstance.post(apiEndpoints.forgotPassword, { email });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  };

  return <ForgotPasswordForm handleSendResetLink={handleSendResetLink} />;
};

export default Page;
