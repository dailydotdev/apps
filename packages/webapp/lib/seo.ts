const DEFAULT_APP_ORIGIN = 'https://app.daily.dev';
const DEFAULT_SITE_ORIGIN = 'https://daily.dev';

const normalizeOrigin = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const withProtocol =
    value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`;

  return withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol;
};

export const getAppOrigin = (): string =>
  normalizeOrigin(process.env.NEXT_PUBLIC_WEBAPP_URL) || DEFAULT_APP_ORIGIN;

export const getSiteOrigin = (): string =>
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_ORIGIN) || DEFAULT_SITE_ORIGIN;

export const getLlmsTxtUrl = (): string => `${getAppOrigin()}/llms.txt`;
