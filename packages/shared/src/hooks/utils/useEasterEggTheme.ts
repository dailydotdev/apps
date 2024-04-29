import { useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

interface UseEasterEggThemeResult {
  version: number;
  logo?: string;
  logoText?: string;
  body?: Record<string, string>;
  navbar?: string;
  cursor?: string;
}

export const useEasterEggTheme = (): UseEasterEggThemeResult | undefined => {
  const { themeMode } = useSettingsContext();
  const easterEggTheme = useFeature(feature.easterEggTheme);
  const router = useRouter();
  const isOnboarding = router?.pathname?.startsWith('/onboarding') ?? false;
  const useTheme = !isOnboarding && !!easterEggTheme;

  const isLight = useMemo(() => {
    if (themeMode === ThemeMode.Auto) {
      return globalThis?.window?.matchMedia?.('(prefers-color-scheme:light)')
        .matches;
    }

    return themeMode === ThemeMode.Light;
  }, [themeMode]);
  const theme = isLight ? ThemeMode.Light : ThemeMode.Dark;

  useLayoutEffect(() => {
    const elem = globalThis?.document?.body;

    // reset body styles
    if (elem?.style?.cssText) {
      elem.style.cssText = '';
    }

    if (!useTheme) {
      return;
    }

    if (easterEggTheme?.[theme]?.body) {
      Object.entries(easterEggTheme[theme]?.body).forEach(([key, value]) => {
        elem?.style?.setProperty(key, value);
      });
    }

    if (easterEggTheme?.cursor) {
      elem?.style?.setProperty(
        'cursor',
        `url('${easterEggTheme.cursor}'), auto`,
      );
    }
  }, [easterEggTheme, theme, useTheme]);

  if (useTheme) {
    const { light, dark, ...rest } = easterEggTheme;
    const themeProps = isLight ? light : dark;

    return { ...rest, ...themeProps };
  }

  return undefined;
};
