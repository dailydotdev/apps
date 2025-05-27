import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { NextApiRequest, NextApiResponse } from 'next';

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

        const security = {
          Contact: 'mailto:support@daily.dev',
          Expires: expiresDate.toISOString(),
          'Preferred-Languages': 'en',
          Canonical: 'https://app.daily.dev/.well-known/security.txt',
          Hiring: 'https://daily.dev/careers',
        };

        res
          .setHeader(
            'Cache-Control',
            `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneMinute}`,
          )
          .status(200)
          .send(
            Object.keys(security)
              .map((key) => `${key}: ${security[key]}`)
              .join('\n'),
          );
        break;
      }
      default:
        res.status(405).send(null);
    }
  } catch (error) {
    const statusCode = error.statusCode || 500;

    // eslint-disable-next-line no-console
    console.error(error);

    res
      .status(statusCode)
      .send(statusCode < 500 ? error.message : 'internal server error');
  }
};

export default handler;
