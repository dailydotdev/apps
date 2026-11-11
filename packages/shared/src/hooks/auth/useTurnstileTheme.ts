import { useEffect, useState } from 'react';
import { ThemeMode } from '../../contexts/SettingsContext';

export type TurnstileTheme = 'light' | 'dark' | 'auto';

// Pages can force a theme over the user's setting (/onboarding and Plus force
// dark, articles force light), so read the theme that is actually applied to
// the document instead of the settings value. `auto` follows the OS, like
// Cloudflare's own `auto`.
const getAppliedTheme = (): TurnstileTheme => {
  const classList = globalThis?.document?.documentElement?.classList;
  if (classList?.contains(ThemeMode.Light)) {
    return 'light';
  }
  if (classList?.contains(ThemeMode.Auto)) {
    return 'auto';
  }
  return 'dark';
};

export const useTurnstileTheme = (): TurnstileTheme => {
  const [theme, setTheme] = useState<TurnstileTheme>(getAppliedTheme);

  useEffect(() => {
    const root = globalThis?.document?.documentElement;
    if (!root || typeof MutationObserver === 'undefined') {
      return undefined;
    }

    setTheme(getAppliedTheme());
    const observer = new MutationObserver(() => setTheme(getAppliedTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return theme;
};
