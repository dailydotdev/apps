import createDOMPurify from 'dompurify';
import type { GetServerSidePropsContext } from 'next/dist/types';
import type { FunnelBootResponse } from '../types/funnelBoot';

/**
 * Sanitizes HTML string and allows only bold tags
 */
export const sanitizeMessage = (
  message: string,
  allowedTags = ['b', 'strong', 'br'],
): string => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return message;
  }

  const purify = createDOMPurify(window);

  return purify.sanitize(message, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
  });
};

const brokenWebviewPatterns = [
  /FBAN|FBAV/i, // Facebook App
  /Messenger/i, // Facebook Messenger
  /LinkedIn/i, // LinkedIn
];

export function shouldRedirectAuth(): boolean {
  const ua = navigator.userAgent;

  return brokenWebviewPatterns.some((pattern) => pattern.test(ua));
}

export const AUTH_REDIRECT_KEY = 'auth_redirect';

export const getCookiesAndHeadersFromRequest = (
  req: GetServerSidePropsContext['req'],
): {
  cookies: string;
  forwardedHeaders: Record<string, string>;
} => {
  const allCookies = req.headers.cookie || '';

  // Extract forwarded headers
  const forwardedHeaders: Record<string, string> = {};
  ['x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host'].forEach(
    (header) => {
      const value = req.headers[header] as string;
      if (value) {
        forwardedHeaders[header] = value;
      }
    },
  );
  if (!forwardedHeaders['x-forwarded-for']) {
    forwardedHeaders['x-forwarded-for'] = req.socket.remoteAddress;
  }

  return { cookies: allCookies, forwardedHeaders };
};

export function setResponseHeaderFromBoot(
  boot: FunnelBootResponse,
  res: GetServerSidePropsContext['res'],
) {
  const setCookieHeader = boot.response.headers.get('set-cookie');
  if (setCookieHeader) {
    res.setHeader('Set-Cookie', setCookieHeader);
  }
}
