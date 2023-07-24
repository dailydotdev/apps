import { useContext, useEffect, useRef } from 'react';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useExtensionPermission } from './useExtensionPermission';

export const useCompanionSettings = (origin: string): void => {
  const isOnLoad = useRef(true);
  const { optOutCompanion, loadedSettings } = useContext(SettingsContext);
  const { contentScriptGranted, registerBrowserContentScripts } =
    useExtensionPermission({ origin });

  useEffect(() => {
    if (optOutCompanion || contentScriptGranted || !loadedSettings) {
      return;
    }

    if (isOnLoad.current) {
      isOnLoad.current = false;
      return;
    }

    registerBrowserContentScripts();
  }, [optOutCompanion, loadedSettings]);
};
