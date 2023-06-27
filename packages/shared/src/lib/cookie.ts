import { IFlags } from 'flagsmith';
import { FeatureValue } from './featureManagement';
import { isPreviewDeployment } from './links';

export const COOKIE_FEATURES_KEY = 'preview:featuresFlags';

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

export const getCookieFeatureFlags = (): Record<string, FeatureValue> => {
  const cookie = getCookieObject();
  const value = cookie[COOKIE_FEATURES_KEY] as string;

  if (!value) {
    return {};
  }

  try {
    const features = JSON.parse(value);
    delete features.flags;
    return features;
  } catch (err) {
    return {};
  }
};

export const setCookie = (
  name: string,
  value: string | number | boolean,
  options: Partial<{
    domain: string;
    expires: Date | string;
    maxAge: number;
    partitioned: boolean;
    path: string;
    sameSite: 'lax' | 'strict' | 'none';
    secure: boolean;
  }> = {},
): void => {
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

    if (typeof option === 'undefined') {
      return acc;
    }

    if (typeof option === 'boolean') {
      return option ? `${acc}; ${key}` : acc;
    }

    return `${acc}; ${key}=${option}`;
  }, `${name}=${encodeURIComponent(value)}`);

  document.cookie = cookieValue;
};

export const updateFeatureFlags = (
  flags: IFlags,
  obj: Record<string, FeatureValue>,
): IFlags =>
  Object.keys(obj).reduce((features, key) => {
    const value = obj[key];
    if (!value) {
      return features;
    }

    return { ...features, [key]: { enabled: true, value } } as IFlags;
  }, flags);

if (isPreviewDeployment) {
  const setFeature = (key: string, value: FeatureValue) => {
    const features = getCookieFeatureFlags();
    features[key] = value;
    setCookie(COOKIE_FEATURES_KEY, JSON.stringify(features));
  };

  const getFeatures = getCookieFeatureFlags;

  const getFeature = (key: string) => {
    const features = getCookieFeatureFlags();
    return features[key];
  };

  const removeFeature = (key: string) => {
    const features = getCookieFeatureFlags();
    delete features[key];
    setCookie(COOKIE_FEATURES_KEY, JSON.stringify(features));
  };

  const clearFeatures = () => {
    setCookie(COOKIE_FEATURES_KEY, JSON.stringify({}));
  };

  globalThis.setFeature = setFeature;
  globalThis.getFeature = getFeature;
  globalThis.getFeatures = getFeatures;
  globalThis.removeFeature = removeFeature;
  globalThis.clearFeatures = clearFeatures;
}
