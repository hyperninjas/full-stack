export const rootPaths = {
  root: '/',
  pagesRoot: 'pages',
  authRoot: 'authentication',
  authDefaultAuth0Root: 'default/auth0',
  errorRoot: 'error',
};

const paths = {
  starter: `/${rootPaths.pagesRoot}/starter`,

  defaultAuth0Login: `/${rootPaths.authRoot}/${rootPaths.authDefaultAuth0Root}/login`,
  
  notifications: `/${rootPaths.pagesRoot}/notifications`,

  defaultLoggedOut: `/${rootPaths.authRoot}/default/logged-out`,

  404: `/${rootPaths.errorRoot}/404`,
};

export const authPaths = {
  /* ---------------------------------Auth0----------------------------------------- */
  login: paths.defaultAuth0Login,
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
