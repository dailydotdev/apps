import { useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { HapticStyle, playHaptic } from '../lib/nativeBridge';

export const useHaptic = (): ((style?: HapticStyle) => void) => {
  const { isAndroidApp } = useAuthContext();

  return useCallback(
    (style: HapticStyle = HapticStyle.Light) => playHaptic(style, isAndroidApp),
    [isAndroidApp],
  );
};
