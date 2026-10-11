import { useAuthContext } from '../../contexts/AuthContext';
import { isIOSNative, isPWA } from '../../lib/func';

export type ShellFieldPlacement = 'top' | 'bottom';

// The native apps and an installed PWA own the whole screen, so the search
// field floats above the bottom bar within thumb reach. A browser tab already
// has the browser's own controls at the bottom (Safari's toolbar, Chrome's
// address bar), so there the field sits at the top of the page instead.
export const useShellFieldPlacement = (): ShellFieldPlacement => {
  // Shared pieces render provider-light in specs and stories.
  const isAndroidApp = useAuthContext()?.isAndroidApp;
  const isClient = typeof window !== 'undefined';

  return isAndroidApp || (isClient && (isIOSNative() || isPWA()))
    ? 'bottom'
    : 'top';
};
