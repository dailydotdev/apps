export const TRACKING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10;

export const extractRootDomain = (hostname: string): string => {
  const host = hostname.split(':')[0];
  if (host === '127.0.0.1') {
    return host;
  }
  const parts = host.split('.');
  while (parts.length > 2) {
    parts.shift();
  }
  return parts.join('.');
};
