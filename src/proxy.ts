import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const authCookie = req.cookies.get('ironetch_admin');
    
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
