import { useMemo } from 'react';

import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';
import colors from '../../styles/colors';

interface UseAsset {
  onboardingIntroduction: string;
  scrollBlock: string;
  notFound: string;
  themeColor: string;
  githubShortcut: string;
  slackIntegrationHeader: string;
  gardrError: string;
}

export const useIsLightTheme = (): boolean => {
  const { themeMode } = useSettingsContext();

  return useMemo(() => {
    if (themeMode === ThemeMode.Auto) {
      return globalThis?.window?.matchMedia?.('(prefers-color-scheme:light)')
        .matches;
    }

    return themeMode === ThemeMode.Light;
  }, [themeMode]);
};

export const useThemedAsset = (): UseAsset => {
  const isLight = useIsLightTheme();

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
    slackIntegrationHeader: isLight
      ? cloudinary.integrations.slack.header.light
      : cloudinary.integrations.slack.header.dark,
    gardrError: isLight
      ? cloudinary.generic.error.light
      : cloudinary.generic.error.dark,
  };
};
