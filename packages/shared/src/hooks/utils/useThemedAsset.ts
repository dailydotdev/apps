import { useMemo } from 'react';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import colors from '../../styles/colors';
import {
  cloudinaryFeedFiltersYourFeedLight,
  cloudinaryFeedFiltersYourFeedDark,
  cloudinaryFeedFiltersScrollLight,
  cloudinaryFeedFiltersScrollDark,
  cloudinaryGenericNotFoundLight,
  cloudinaryGenericNotFoundDark,
  cloudinaryShortcutsIconsGithubLight,
  cloudinaryShortcutsIconsGithubDark,
  cloudinaryIntegrationsSlackHeaderLight,
  cloudinaryIntegrationsSlackHeaderDark,
  cloudinaryGenericErrorLight,
  cloudinaryGenericErrorDark,
} from '../../lib/image';

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
      ? cloudinaryFeedFiltersYourFeedLight
      : cloudinaryFeedFiltersYourFeedDark,
    scrollBlock: isLight
      ? cloudinaryFeedFiltersScrollLight
      : cloudinaryFeedFiltersScrollDark,
    notFound: isLight
      ? cloudinaryGenericNotFoundLight
      : cloudinaryGenericNotFoundDark,
    themeColor: isLight ? colors.salt['0'] : colors.pepper['90'],
    githubShortcut: isLight
      ? cloudinaryShortcutsIconsGithubLight
      : cloudinaryShortcutsIconsGithubDark,
    slackIntegrationHeader: isLight
      ? cloudinaryIntegrationsSlackHeaderLight
      : cloudinaryIntegrationsSlackHeaderDark,
    gardrError: isLight
      ? cloudinaryGenericErrorLight
      : cloudinaryGenericErrorDark,
  };
};
