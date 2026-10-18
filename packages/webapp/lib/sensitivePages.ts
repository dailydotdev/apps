const SQUAD_INVITE_PAGE = '/squads/[handle]/[token]';

export const SENSITIVE_PAGES = [
  '/callback',
  '/join/organization',
  '/oauth/consent',
  '/oauth/login',
  '/reset-password',
  SQUAD_INVITE_PAGE,
  '/verification',
];

export const isSensitivePage = (pathname: string): boolean =>
  SENSITIVE_PAGES.includes(pathname);

export const redactSensitivePath = (route: string, path: string): string =>
  route === SQUAD_INVITE_PAGE
    ? path.replace(/\/[^/]+\/?$/, '/[redacted]')
    : path;
