import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname, search } = request.nextUrl;

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  const isAuthRoute = pathname.startsWith('/auth');
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images') ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$/i.test(pathname);
  const isApiRoute = pathname.startsWith('/api');

  if (isStaticAsset || isApiRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isAuthRoute && !sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    const nextPath = pathname + (search || '');
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'],
};
