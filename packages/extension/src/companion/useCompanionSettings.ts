import { useContext, useEffect, useRef, useMemo } from 'react';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { useExtensionPermission } from './useExtensionPermission';

interface UseCompanionSettings {
  placement: string;
}

export const useCompanionSettings = (origin: string): UseCompanionSettings => {
  const isOnLoad = useRef(true);
  const { flags } = useContext(FeaturesContext);
  const placement = getFeatureValue(
    Features.CompanionPermissionPlacement,
    flags,
  );
  const { optOutCompanion, toggleOptOutCompanion, loadedSettings } =
    useContext(SettingsContext);
  const { contentScriptGranted, requestContentScripts } =
    useExtensionPermission({ origin });

  useEffect(() => {
    if (
      placement === 'off' ||
      optOutCompanion ||
      contentScriptGranted ||
      !loadedSettings
    ) {
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
  }, [placement, optOutCompanion, loadedSettings]);

  return useMemo(() => ({ placement }), [placement]);
};
