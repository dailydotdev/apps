import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { NextApiRequest, NextApiResponse } from 'next';

type RouteError = Error & { statusCode?: number };

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  res.setHeaders(
    new Headers({
      'Content-Type': 'text/plain',
    }),
  );

  try {
    switch (req.method) {
      case 'GET': {
        const expiresDate = new Date();
        expiresDate.setUTCMonth(11);
        expiresDate.setUTCDate(31);
        expiresDate.setUTCHours(23);
        expiresDate.setUTCMinutes(59);
        expiresDate.setUTCSeconds(59);
        expiresDate.setUTCMilliseconds(999);

        const security: Record<string, string> = {
          Contact: 'mailto:support@daily.dev',
          Expires: expiresDate.toISOString(),
          'Preferred-Languages': 'en',
          Canonical: 'https://daily.dev/.well-known/security.txt',
          Hiring: 'https://daily.dev/careers',
        };

        res
          .setHeader(
            'Cache-Control',
            `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneMinute}`,
          )
          .status(200)
          .send(
            Object.entries(security)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n'),
          );
        break;
      }
      default:
        res.status(405).send(null);
    }
  } catch (error) {
    const routeError = error as RouteError;
    const statusCode = routeError.statusCode || 500;

    // eslint-disable-next-line no-console
    console.error(error);

    res
      .status(statusCode)
      .send(statusCode < 500 ? routeError.message : 'internal server error');
  }
};

export default handler;
