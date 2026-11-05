import { useCallback } from 'react';
import { HapticStyle, playHaptic } from '../lib/nativeBridge';

export const useHaptic = (): ((style?: HapticStyle) => void) =>
  useCallback(
    (style: HapticStyle = HapticStyle.Light) => playHaptic(style),
    [],
  );
