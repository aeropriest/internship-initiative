import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/dashboard/applications', '/dashboard/quiz-results'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isProtectedPath) {
    // Check if the user is authenticated
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      // Redirect to login page if not authenticated
      const url = new URL('/dashboard/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
