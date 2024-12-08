import { NextRequest, NextResponse } from 'next/server';

const trafficPercentage = 10;

const cfCookieName = 'cf-override';

const isDev = process.env.NODE_ENV !== 'production';

const middleware = async (req: NextRequest): Promise<NextResponse> => {
  let cfCookie = req.cookies.get(cfCookieName)?.value;

  const nextResponse = NextResponse.next();

  if (typeof cfCookie === 'undefined') {
    const shouldOverride = Math.random() < trafficPercentage / 100;

    nextResponse.cookies.set(cfCookieName, shouldOverride ? 'true' : 'false', {
      path: '/',
      maxAge: 1 * 60 * 60,
      secure: !isDev,
      httpOnly: true,
    });

    cfCookie = 'true';
  }

  if (cfCookie === 'true') {
    const cfUrl = new URL(
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
      process.env.CF_OVERRIDE_URL,
    );

    if (!isDev) {
      return NextResponse.rewrite(cfUrl, nextResponse);
    }
  }

  return nextResponse;
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|manifest.json|robots.txt|android-chrome).*)',
    '/',
  ],
};

export { middleware };
