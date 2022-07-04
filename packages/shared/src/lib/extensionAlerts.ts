import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';

const EXTENSION_ALERTS_LOCAL_KEY = 'extension:alerts';

export interface ExtensionAlerts {
  displayCompanionPopup?: boolean;
}

export const getExtensionAlerts = (): ExtensionAlerts => {
  const data = storage.getItem(EXTENSION_ALERTS_LOCAL_KEY);

  if (!data) {
    return {};
  }

  try {
    return JSON.parse(data);
  } catch (ex) {
    return {};
  }
};

export const updateExtensionAlerts = (
  current: ExtensionAlerts,
  updated: ExtensionAlerts,
): ExtensionAlerts => {
  const data = { ...current, ...updated };
  storage.setItem(EXTENSION_ALERTS_LOCAL_KEY, JSON.stringify(data));
  return data;
};
