import { isPWA } from '../../../lib/func';

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<'accepted' | 'dismissed'>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPWA {
  isAvailable: boolean;
  isInstalledPWA: boolean;
  promptToInstall: (() => Promise<void | 'accepted' | 'dismissed'>) | null;
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
  const isInstalledPWA = isPWA();
  const isAvailable = !!installEvent;

  const promptToInstall = async () => {
    try {
      if (prompt) {
        await installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        return outcome;
      }
    } catch (e) {
      console.error('Error during PWA installation:', e);
    }

    return console.error(
      'Tried installing before browser sent "beforeinstallprompt" event',
    );
  };

  return { isInstalledPWA, isAvailable, promptToInstall };
};
