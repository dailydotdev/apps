import { isNullOrUndefined } from './func';

export type CookieOptions = {
  domain: string;
  expires: Date | string;
  maxAge: number;
  partitioned: boolean;
  path: string;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
};

export const setCookie = (
  name: string,
  value: string | number | boolean,
  options: Partial<CookieOptions> = {},
): void => {
  if (typeof document === 'undefined') {
    throw new Error('can only be used in the browser environment');
  }

  if (!name || !value) {
    throw new Error('name and value are required');
  }

  const parsedOptions = {
    domain: options.domain,
    expires:
      options.expires instanceof Date
        ? options.expires.toUTCString()
        : options.expires,
    'max-age': options.maxAge,
    partitioned: options.partitioned,
    path: options.path,
    samesite: options.sameSite,
    secure: options.secure,
  };

  const cookieValue: string = Object.keys(parsedOptions).reduce((acc, key) => {
    const option = parsedOptions[key];

    if (isNullOrUndefined(option)) {
      return acc;
    }

    if (typeof option === 'boolean') {
      return option ? `${acc}; ${key}` : acc;
    }

    return `${acc}; ${key}=${option}`;
  }, `${name}=${encodeURIComponent(value)}`);

  document.cookie = cookieValue;
};

export const expireCookie = (
  name: string,
  options: Partial<Pick<CookieOptions, 'path' | 'domain'>> = {},
): void => {
  const { path, domain } = options;

  setCookie(name, 'expired', { path, domain, maxAge: 0 });
};
