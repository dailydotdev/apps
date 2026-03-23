import { isDevelopment } from '../../lib/constants';

const DEBUG_TOGGLE_QUERY_PARAM = 'debug_notification_experiment';
const DEBUG_VARIATION_QUERY_PARAM = 'debug_notification_variation';
const DEBUG_TOGGLE_STORAGE_KEY = 'debug_notification_experiment';
const DEBUG_VARIATION_STORAGE_KEY = 'debug_notification_variation';

export const NotificationDebugVariation = {
  All: 'all',
  Control: 'control',
  Hero: 'hero',
  Inline: 'inline',
} as const;

type NotificationDebugVariationType =
  (typeof NotificationDebugVariation)[keyof typeof NotificationDebugVariation];

const variationValues = new Set<NotificationDebugVariationType>(
  Object.values(NotificationDebugVariation),
);

const parseDebugToggle = (value: string | null): boolean | undefined => {
  if (!value) {
    return undefined;
  }

  if (value === '1' || value === 'true' || value === 'on') {
    return true;
  }

  if (value === '0' || value === 'false' || value === 'off') {
    return false;
  }

  return undefined;
};

const parseDebugVariation = (
  value: string | null,
): NotificationDebugVariationType | undefined => {
  if (!value) {
    return undefined;
  }

  return variationValues.has(value as NotificationDebugVariationType)
    ? (value as NotificationDebugVariationType)
    : undefined;
};

const getQueryParam = (param: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get(param);
};

const getStorageValue = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageValue = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage failures in debug mode.
  }
};

const resolveDebugToggle = (): boolean => {
  const queryValue = parseDebugToggle(getQueryParam(DEBUG_TOGGLE_QUERY_PARAM));
  if (queryValue !== undefined) {
    setStorageValue(DEBUG_TOGGLE_STORAGE_KEY, queryValue ? '1' : '0');
    return queryValue;
  }

  return getStorageValue(DEBUG_TOGGLE_STORAGE_KEY) === '1';
};

const resolveDebugVariation = (): NotificationDebugVariationType | null => {
  const queryValue = parseDebugVariation(
    getQueryParam(DEBUG_VARIATION_QUERY_PARAM),
  );
  if (queryValue) {
    setStorageValue(DEBUG_VARIATION_STORAGE_KEY, queryValue);
    return queryValue;
  }

  const storedValue = parseDebugVariation(
    getStorageValue(DEBUG_VARIATION_STORAGE_KEY),
  );
  return storedValue ?? null;
};

export const isNotificationExperimentDebugEnabled = (): boolean => {
  if (!isDevelopment) {
    return false;
  }

  return resolveDebugToggle();
};

export const getNotificationExperimentDebugVariation =
  (): NotificationDebugVariationType | null => {
    if (!isNotificationExperimentDebugEnabled()) {
      return null;
    }

    return resolveDebugVariation() ?? NotificationDebugVariation.All;
  };

export const isNotificationExperimentVariationDebugEnabled = (
  variation: NotificationDebugVariationType,
): boolean => {
  const debugVariation = getNotificationExperimentDebugVariation();
  if (!debugVariation) {
    return false;
  }

  return (
    debugVariation === NotificationDebugVariation.All ||
    debugVariation === variation
  );
};
