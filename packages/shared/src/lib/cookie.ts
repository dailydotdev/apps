import { isDevelopment } from './constants';
import { FeatureValue } from './featureManagement';
import { checkIsPreviewDeployment } from './links';

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

export const getCookieFeatureFlags = (): Record<string, unknown> => {
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

export const isPreviewDeployment = checkIsPreviewDeployment() || isDevelopment;

if (isPreviewDeployment) {
  const setFeature = (key: string, value: FeatureValue) => {
    const features = getCookieFeatureFlags();
    features[key] = value;
    document.cookie = `${COOKIE_FEATURES_KEY}=${JSON.stringify(features)}`;
  };

  const getFeatures = getCookieFeatureFlags;

  const getFeature = (key: string) => {
    const features = getCookieFeatureFlags();
    return features[key];
  };

  const removeFeature = (key: string) => {
    const features = getCookieFeatureFlags();
    delete features[key];
    document.cookie = `${COOKIE_FEATURES_KEY}=${JSON.stringify(features)}`;
  };

  globalThis.setFeature = setFeature;
  globalThis.getFeature = getFeature;
  globalThis.getFeatures = getFeatures;
  globalThis.removeFeature = removeFeature;
}
