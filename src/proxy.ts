import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const decoded = Buffer.from(authValue, 'base64').toString();
      const [user, pwd] = decoded.split(':');

      const validUser = 'admin';
      const validPwd = process.env.ADMIN_PASSWORD || 'ironetch2026';

      if (user === validUser && pwd === validPwd) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/auth';
    return new NextResponse('Authentication required to access the IronEtch Control Center.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
