import type { NextRequest } from 'next/server';
import { userAgent } from 'next/server';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import { generateLogEventId } from '@dailydotdev/shared/src/lib/logEventId';

const SERVER_PAGE_REQUEST_EVENT = 'server page request';
const UNKNOWN_DEVICE_ID = 'unknown';

export type ServerPageRequestVariant = 'html' | 'markdown';

export const logServerPageRequest = async (
  req: NextRequest,
  variant: ServerPageRequestVariant,
): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || process.env.DISABLE_SERVER_REQUEST_LOGGING === 'true') {
    return;
  }

  const { ua } = userAgent(req);
  const clientIp = req.headers.get('cf-connecting-ip');

  try {
    const now = new Date();
    const deviceId = req.cookies.get('da2')?.value ?? UNKNOWN_DEVICE_ID;
    const eventPayload = {
      app_platform: BootApp.Webapp,
      device_id: deviceId,
      event_id: generateLogEventId(now),
      event_name: SERVER_PAGE_REQUEST_EVENT,
      event_page: req.nextUrl.pathname,
      event_timestamp: now,
      extra: JSON.stringify({ content_variant: variant }),
      session_id: crypto.randomUUID(),
      user_agent: ua,
      user_id: deviceId,
      visit_id: crypto.randomUUID(),
    };

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(eventPayload);
    }

    await fetch(`${apiUrl}/e`, {
      method: 'POST',
      body: JSON.stringify({ events: [eventPayload] }),
      headers: {
        'content-type': 'application/json',
        'user-agent': ua,
        ...(clientIp && { 'x-forwarded-for': clientIp }),
      },
    });
  } catch {
    // Request logging must never affect the response.
  }
};
