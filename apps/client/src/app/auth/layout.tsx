import { PropsWithChildren } from 'react';
import AuthLayout from 'layouts/auth-layout';
import DefaultAuthLayout from 'layouts/auth-layout/DefaultAuthLayout';
import { Configuration, HealthApi } from '@/api';

const Layout = async ({ children }: PropsWithChildren) => {
  return <DefaultAuthLayout>{children}</DefaultAuthLayout>;
};

export default Layout;
