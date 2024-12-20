import { isPWA } from '../../../lib/func';

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<'accepted' | 'dismissed'>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPWA {
  isAvailable: boolean;
  isCurrentPWA: boolean;
  promptToInstall: (() => Promise<null | 'accepted' | 'dismissed'>) | null;
}

let installEvent: IBeforeInstallPromptEvent | null = null;
globalThis?.addEventListener?.(
  'beforeinstallprompt',
  (e: IBeforeInstallPromptEvent) => {
    e.preventDefault();
    installEvent = e;
  },
  { once: true },
);

export const useInstallPWA = (): UseInstallPWA => {
  const isCurrentPWA = isPWA();
  const isAvailable = !!installEvent;

  const promptToInstall = async () => {
    if (installEvent) {
      await installEvent.prompt?.();
      const { outcome } = await installEvent.userChoice;
      return outcome;
    }

    return null;
  };

  return { isCurrentPWA, isAvailable, promptToInstall };
};
