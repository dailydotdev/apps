import { NextResponse, type NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';

export function middleware(request: NextRequest): NextResponse<unknown> {
  const { country } = geolocation(request);
  request.headers.get('x-vercel-ip-country');

  const response = NextResponse.next();

  response.headers.set('x-geo-header-test', country);
  response.headers.set(
    'x-vercel-country-test',
    request.headers.get('x-vercel-ip-country'),
  );
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/squads/:path*',
};
