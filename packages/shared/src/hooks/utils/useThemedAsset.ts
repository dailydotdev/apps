import { useMemo } from 'react';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';

interface UseCloudinaryAsset {
  onboardingIntroduction: string;
  scrollBlock: string;
  isLight: boolean;
}

export const useThemedAsset = (): UseCloudinaryAsset => {
  const { themeMode } = useSettingsContext();
  const isLight = useMemo(() => {
    if (themeMode === ThemeMode.Auto) {
      return globalThis?.window?.matchMedia?.('(prefers-color-scheme:light)')
        .matches;
    }

    return themeMode === ThemeMode.Light;
  }, [themeMode]);

  return {
    isLight,
    onboardingIntroduction: isLight
      ? cloudinary.feedFilters.yourFeed.light
      : cloudinary.feedFilters.yourFeed.dark,
    scrollBlock: isLight
      ? cloudinary.feedFilters.scroll.light
      : cloudinary.feedFilters.scroll.dark,
  };
};
