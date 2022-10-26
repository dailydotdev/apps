export const getCookieObject = (): Record<string, unknown> => {
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
): UnknownObject =>
  keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {});
