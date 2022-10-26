import { isNullOrUndefined } from './func';

export const getCookieObject = (): Record<string, unknown> => {
  if (typeof document === 'undefined') {
    return {};
  }

  const cookie = {};
  document.cookie.split(';').forEach((el) => {
    const [key, value] = el.split('=');
    cookie[key.trim()] = decodeURIComponent(value);
  });

  return cookie;
};

type UnknownObject = Record<string | number, unknown>;

export const getObjectFeaturesFlags = (
  keys: string[],
  obj: UnknownObject,
  origin?: UnknownObject,
): UnknownObject =>
  keys.reduce((result, key) => {
    const value = obj[key];

    if (isNullOrUndefined(value)) {
      return result;
    }

    if (!origin || typeof origin[key] !== 'boolean') {
      return { ...result, [key]: value };
    }

    if (value === 'true') {
      return { ...result, [key]: true };
    }

    if (value === 'false') {
      return { ...result, [key]: false };
    }

    return { ...result, [key]: !!value };
  }, {});
