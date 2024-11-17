import { NextResponse, type NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest): NextResponse<unknown> {
  const xVercel = request.headers['x-vercel-ip-country'];
  const { country } = geolocation(request);

  const response = NextResponse.next();

  response.headers.set('x-geo-header-test', country);
  response.headers.set('x-vercel-ip-country-test', xVercel);

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/squads/:path*',
};
