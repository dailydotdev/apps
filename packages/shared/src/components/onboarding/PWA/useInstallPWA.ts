import { useEffect, useState } from 'react';

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<'accepted' | 'dismissed'>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPWA {
  isAvailable: boolean;
  isInstalledPWA: boolean;
  promptToInstall: (() => Promise<void | 'accepted' | 'dismissed'>) | null;
}

export const useInstallPWA = (): UseInstallPWA => {
  const isInstalledPWA =
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia('(display-mode: standalone)').matches;

  const [prompt, setPrompt] = useState<IBeforeInstallPromptEvent | null>(null);
  const isAvailable = !!prompt;

  const promptToInstall = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      return outcome;
    }
    return Promise.reject(
      new Error(
        'Tried installing before browser sent "beforeinstallprompt" event',
      ),
    );
  };

  useEffect(() => {
    console.log('add listener beforeinstallprompt');

    const ready = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      console.log('Set prompt!');
      setPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', ready);

    return () => {
      window.removeEventListener('beforeinstallprompt', ready);
    };
  }, []);

  return { isInstalledPWA, isAvailable, promptToInstall };
};
