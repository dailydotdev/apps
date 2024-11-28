export interface UseInstallPWA {
  installPWA: (() => Promise<void>) | null;
  isInstalledPWA: boolean;
}

let installPWA: UseInstallPWA['installPWA'] = null;
globalThis?.addEventListener?.(
  'beforeinstallprompt',
  (
    e: Event & {
      prompt: () => Promise<void>;
    },
  ) => {
    console.log('beforeinstallprompt');
    installPWA = () => e.prompt();
  },
);

export const useInstallPWA = (): UseInstallPWA => {
  const isInstalledPWA =
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia('(display-mode: standalone)').matches;
  return { isInstalledPWA, installPWA };
};
