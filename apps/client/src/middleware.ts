import { withAuth } from 'next-auth/middleware';
import paths from 'routes/paths';

export default withAuth({
  pages: {
    signIn: paths.defaultAuth0Login,
    signOut: paths.defaultLoggedOut,
  },
});

// auth-guard to be implemented
export const config = { matcher: ['/dashboards/:path*'] };
