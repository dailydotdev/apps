import { createSerwistRoute } from '@serwist/turbopack';

const route = createSerwistRoute({
  swSrc: 'app/sw.ts',
  useNativeEsbuild: true,
});

export const { dynamic, dynamicParams, revalidate, generateStaticParams } =
  route;

// Browsers only pick up a new deployment once they re-fetch the service
// worker script, and that fetch honors HTTP caching. Without an explicit
// header this route is served with a multi-hour TTL, which pins logged-in
// users (the only ones with the SW registered) to the previous build's
// precache long after a deploy. `no-cache` keeps the response cacheable but
// forces revalidation on every SW update check.
export const GET = async (
  ...args: Parameters<typeof route.GET>
): Promise<Response> => {
  const response = await route.GET(...args);
  response.headers.set('Cache-Control', 'no-cache, must-revalidate');
  return response;
};
