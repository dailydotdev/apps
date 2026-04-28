import { useCallback } from 'react';
import { useSettingsContext } from '../../../../contexts/SettingsContext';

export function useLegacyPostLayoutOptOut(): {
  isOptedOut: boolean;
  optOut: () => void;
  optIn: () => void;
} {
  const { flags, updateFlag } = useSettingsContext();
  const isOptedOut = flags?.legacyPostLayoutOptOut ?? false;

  const optOut = useCallback(() => {
    updateFlag('legacyPostLayoutOptOut', true);
  }, [updateFlag]);

  const optIn = useCallback(() => {
    updateFlag('legacyPostLayoutOptOut', false);
  }, [updateFlag]);

  return { isOptedOut, optOut, optIn };
}
