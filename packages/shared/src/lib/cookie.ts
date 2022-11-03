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

export const updateFeatureFlags = (
  flags: IFlags,
  obj: Record<string, FeatureValue>,
): IFlags =>
  Object.keys(obj).reduce((features, key) => {
    const value = obj[key];
    if (!value) {
      return features;
    }

    return { ...features, [key]: { enabled: true, value } };
  }, flags);

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

  const clearFeatures = () => {
    document.cookie = `${COOKIE_FEATURES_KEY}=${JSON.stringify({})}`;
  };

  globalThis.setFeature = setFeature;
  globalThis.getFeature = getFeature;
  globalThis.getFeatures = getFeatures;
  globalThis.removeFeature = removeFeature;
  globalThis.clearFeatures = clearFeatures;
}
