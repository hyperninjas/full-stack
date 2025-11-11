import { authPaths } from 'routes/paths';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Page = () => {
  return (
    <LoginForm
      signUpLink={authPaths.signup}
      forgotPasswordLink={authPaths.forgotPassword}
      socialAuth={true}
      rememberDevice={true}
    />
  );
};

export default Page;
