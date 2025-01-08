import type { BrowserName } from '../../../lib/func';
import { getCurrentBrowserName, isPWA } from '../../../lib/func';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<'accepted' | 'dismissed'>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPWA {
  isAvailable: boolean;
  isCurrentPWA: boolean;
  promptToInstall: (() => Promise<null | 'accepted' | 'dismissed'>) | null;
  browserName: BrowserName;
}

let installEvent: BeforeInstallPromptEvent | null = null;
globalThis?.addEventListener?.(
  'beforeinstallprompt',
  (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    installEvent = e;
  },
  { once: true },
);

export const useInstallPWA = (): UseInstallPWA => {
  const isCurrentPWA = isPWA();
  const isAvailable = !!installEvent;
  const browserName = getCurrentBrowserName();

  const promptToInstall = async () => {
    if (installEvent) {
      await installEvent.prompt?.();
      const { outcome } = await installEvent.userChoice;
      return outcome;
    }

    return null;
  };

  return { isCurrentPWA, isAvailable, promptToInstall, browserName };
};
