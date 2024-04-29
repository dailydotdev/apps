import { useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

interface UseFeatureThemeResult {
  version: number;
  logo?: string;
  logoText?: string;
  body?: Record<string, string>;
  navbar?: string;
  cursor?: string;
}

export const useFeatureTheme = (): UseFeatureThemeResult | undefined => {
  const { themeMode } = useSettingsContext();
  const featureTheme = useFeature(feature.featureTheme);
  const router = useRouter();
  const isOnboarding = router?.pathname?.startsWith('/onboarding') ?? false;
  const useTheme = !isOnboarding && !!featureTheme;

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

    if (featureTheme?.[theme]?.body) {
      Object.entries(featureTheme[theme]?.body).forEach(([key, value]) => {
        elem?.style?.setProperty(key, value);
      });
    }

    if (featureTheme?.cursor) {
      elem?.style?.setProperty('cursor', `url('${featureTheme.cursor}'), auto`);
    }
  }, [featureTheme, theme, useTheme]);

  if (useTheme) {
    const { light, dark, ...rest } = featureTheme;
    const themeProps = isLight ? light : dark;

    return { ...rest, ...themeProps };
  }

  return undefined;
};
