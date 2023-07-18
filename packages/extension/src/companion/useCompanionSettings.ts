import { useContext, useEffect, useRef } from 'react';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useExtensionPermission } from './useExtensionPermission';

export const useCompanionSettings = (origin: string): void => {
  const isOnLoad = useRef(true);
  const { optOutCompanion, toggleOptOutCompanion, loadedSettings } =
    useContext(SettingsContext);
  const { contentScriptGranted, requestContentScripts } =
    useExtensionPermission({ origin });

  const shouldNotToggleCompanion =
    optOutCompanion || contentScriptGranted || !loadedSettings;

  useEffect(() => {
    if (shouldNotToggleCompanion) {
      return;
    }

    if (isOnLoad.current) {
      isOnLoad.current = false;
      return;
    }

    requestContentScripts().then((granted) => {
      if (!granted) {
        toggleOptOutCompanion();
      }
    });
  }, [shouldNotToggleCompanion, requestContentScripts, toggleOptOutCompanion]);
};
