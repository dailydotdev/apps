import { useMemo } from 'react';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import colors from '../../styles/colors';
import { cloudinary } from '../../lib/image';

interface UseAsset {
  onboardingIntroduction: string;
  scrollBlock: string;
  notFound: string;
  themeColor: string;
  githubShortcut: string;
}

export const useThemedAsset = (): UseAsset => {
  const { themeMode } = useSettingsContext();
  const isLight = useMemo(() => {
    if (themeMode === ThemeMode.Auto) {
      return globalThis?.window?.matchMedia?.('(prefers-color-scheme:light)')
        .matches;
    }

    return themeMode === ThemeMode.Light;
  }, [themeMode]);

  return {
    onboardingIntroduction: isLight
      ? cloudinary.feedFilters.yourFeed.light
      : cloudinary.feedFilters.yourFeed.dark,
    scrollBlock: isLight
      ? cloudinary.feedFilters.scroll.light
      : cloudinary.feedFilters.scroll.dark,
    notFound: isLight
      ? cloudinary.generic.notFound.light
      : cloudinary.generic.notFound.dark,
    themeColor: isLight ? colors.salt['0'] : colors.pepper['90'],
    githubShortcut: isLight
      ? cloudinary.shortcuts.icons.github.light
      : cloudinary.shortcuts.icons.github.dark,
  };
};
