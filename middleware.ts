import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is dashboard
  if (path.startsWith('/dashboard')) {
    const session = request.cookies.get('admin_session');
    
    if (!session || session.value !== 'valid') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Note: Removed automatic redirect from /admin to /dashboard to allow users to access login page

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin'],
};
