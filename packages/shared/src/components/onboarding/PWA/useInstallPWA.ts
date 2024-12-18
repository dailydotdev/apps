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
window.addEventListener(
  'beforeinstallprompt',
  (e: IBeforeInstallPromptEvent) => {
    e.preventDefault();
    installEvent = e;
  },
);

export const useInstallPWA = (): UseInstallPWA => {
  const isInstalledPWA = isPWA();

  const isAvailable = !!prompt;

  const promptToInstall = async () => {
    if (prompt) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      return outcome;
    }
    return console.error(
      'Tried installing before browser sent "beforeinstallprompt" event',
    );
  };

  return { isInstalledPWA, isAvailable, promptToInstall };
};
