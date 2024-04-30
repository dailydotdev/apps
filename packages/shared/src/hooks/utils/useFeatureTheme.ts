import { useEffect, useMemo } from 'react';
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

  useEffect(() => {
    const id = 'feature-theme-styles';
    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', id);
    styleElement.setAttribute('type', 'text/css');

    const bodyStyles = [];
    if (featureTheme?.[theme]?.body) {
      Object.entries(featureTheme[theme]?.body).forEach(([key, value]) =>
        bodyStyles.push(`${key}: ${value}`),
      );
    }

    if (featureTheme?.cursor) {
      bodyStyles.push(`cursor: url('${featureTheme.cursor}'), auto; }`);
    }
    const body = `body { ${bodyStyles.join('; ')} }`;

    const oldStyleElem = document.getElementById(id);
    if (oldStyleElem?.innerText === body) {
      // nothing to do, styles were alreay applied
      return;
    }

    styleElement.textContent = body;
    oldStyleElem
      ? document.head.replaceChild(styleElement, oldStyleElem)
      : document.head.appendChild(styleElement);
  }, [featureTheme, theme, useTheme]);

  if (useTheme) {
    const { light, dark, ...rest } = featureTheme;
    const themeProps = isLight ? light : dark;

    return { ...rest, ...themeProps };
  }

  return undefined;
};
