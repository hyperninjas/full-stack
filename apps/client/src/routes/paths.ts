export const rootPaths = {
  root: '/',
  pagesRoot: 'pages',
  authRoot: 'auth',
  authDefaultRoot: 'default',
  errorRoot: 'error',
};

const paths = {
  login: `/${rootPaths.authRoot}/login`,
  signup: `/${rootPaths.authRoot}/signup`,
  forgotPassword: `/${rootPaths.authRoot}/forgot-password`,

  notifications: `/${rootPaths.pagesRoot}/notifications`,

  defaultLoggedOut: `/${rootPaths.authRoot}/default/logged-out`,

  404: `/${rootPaths.errorRoot}/404`,
};

export const authPaths = {
  login: paths.login,
  signup: paths.signup,
  forgotPassword: paths.forgotPassword,
};

export const apiEndpoints = {
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  profile: '/auth/profile',
  getUsers: '/users',
  forgotPassword: '/auth/forgot-password',
  setPassword: '/auth/set-password',
  getProduct: (id: string) => `e-commerce/products/${id}`,
};

export default paths;
