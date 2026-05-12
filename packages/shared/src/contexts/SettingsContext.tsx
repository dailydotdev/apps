import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  ClientOnlySettingsFlag,
  RemoteSettings,
  RemoteTheme,
  SettingsFlags,
  Spaciness,
} from '../graphql/settings';
import {
  CampaignCtaPlacement,
  CLIENT_ONLY_SETTINGS_FLAGS,
  SidebarSelectedCategory,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import { WriteFormTab } from '../components/fields/form/common';
import AuthContext from './AuthContext';
import { capitalize } from '../lib/strings';
import { storageWrapper } from '../lib/storageWrapper';
import { usePersonalizedDigest } from '../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../graphql/users';
import { gqlClient } from '../graphql/common';
import { SortCommentsBy } from '../graphql/comments';

export enum ThemeMode {
  Dark = 'dark',
  Light = 'light',
  Auto = 'auto',
}

interface ThemeOption {
  label: string;
  value: ThemeMode;
}

export const themes: ThemeOption[] = Object.values(ThemeMode).map((theme) => ({
  label: capitalize(theme),
  value: theme,
}));

export interface SettingsContextData extends Omit<RemoteSettings, 'theme'> {
  themeMode: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: (insaneMode: boolean) => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  toggleSidebarExpanded: () => Promise<void>;
  toggleSortingEnabled: () => Promise<void>;
  toggleOptOutReadingStreak: () => Promise<void>;
  toggleOptOutLevelSystem: () => Promise<void>;
  toggleOptOutQuestSystem: () => Promise<void>;
  toggleOptOutCompanion: () => Promise<void>;
  toggleAutoDismissNotifications: () => Promise<void>;
  toggleShowFeedbackButton: () => Promise<void>;
  loadedSettings: boolean;
  updateCustomLinks: (links: string[]) => Promise<unknown>;
  updateSortCommentsBy: (sort: SortCommentsBy) => Promise<unknown>;
  updateFlag: <K extends keyof SettingsFlags>(
    flag: K,
    value: SettingsFlags[K],
  ) => Promise<unknown>;
  updateFlagRemote: <K extends keyof SettingsFlags>(
    flag: K,
    value: SettingsFlags[K],
  ) => Promise<unknown>;
  updatePromptFlag: (flag: string, value: boolean) => Promise<unknown>;
  syncSettings: (bootUserId?: string) => Promise<unknown>;
  onToggleHeaderPlacement(): Promise<unknown>;
  setSettings: (newSettings: Partial<RemoteSettings>) => Promise<void>;
  applyThemeMode: (mode?: ThemeMode) => void;
}

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;

const deprecatedLightModeStorageKey = 'showmethelight';

export const themeModes: Record<RemoteTheme, ThemeMode> = {
  bright: ThemeMode.Light,
  darcula: ThemeMode.Dark,
  auto: ThemeMode.Auto,
};

export const remoteThemes: Record<ThemeMode, RemoteTheme> = {
  [ThemeMode.Light]: 'bright',
  [ThemeMode.Dark]: 'darcula',
  [ThemeMode.Auto]: 'auto',
};

export function applyTheme(
  themeMode: ThemeMode,
  el: HTMLElement = document.documentElement,
): void {
  if (!el || el.classList.contains(themeMode)) {
    return;
  }

  if (themeMode === ThemeMode.Dark) {
    el.classList.remove(ThemeMode.Light);
    el.classList.remove(ThemeMode.Auto);
  } else if (themeMode === ThemeMode.Light) {
    el.classList.add(ThemeMode.Light);
    el.classList.remove(ThemeMode.Auto);
  } else {
    el.classList.remove(ThemeMode.Light);
    el.classList.add(ThemeMode.Auto);
  }
}

export type SettingsContextProviderProps = {
  children?: ReactNode;
  settings?: RemoteSettings;
  updateSettings?: (settings: RemoteSettings) => unknown;
  loadedSettings?: boolean;
};

const CLIENT_ONLY_FLAGS_STORAGE_KEY = 'settings:clientOnlyFlags';

const clientOnlyFlagsSet: ReadonlySet<string> = new Set(
  CLIENT_ONLY_SETTINGS_FLAGS,
);

const isClientOnlyFlag = (key: string): key is ClientOnlySettingsFlag =>
  clientOnlyFlagsSet.has(key);

const splitFlags = (
  flags: SettingsFlags | undefined,
): { remote: SettingsFlags | undefined; local: Partial<SettingsFlags> } => {
  if (!flags) {
    return { remote: undefined, local: {} };
  }

  const remote: Record<string, unknown> = {};
  const local: Record<string, unknown> = {};
  Object.entries(flags).forEach(([key, value]) => {
    if (isClientOnlyFlag(key)) {
      local[key] = value;
      return;
    }
    remote[key] = value;
  });
  return {
    remote: remote as SettingsFlags,
    local: local as Partial<SettingsFlags>,
  };
};

const readLocalFlags = (): Partial<SettingsFlags> => {
  const raw = storageWrapper.getItem(CLIENT_ONLY_FLAGS_STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const local: Record<string, unknown> = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (isClientOnlyFlag(key)) {
        local[key] = value;
      }
    });
    return local as Partial<SettingsFlags>;
  } catch {
    return {};
  }
};

const writeLocalFlags = (flags: Partial<SettingsFlags>): void => {
  if (!Object.keys(flags).length) {
    storageWrapper.removeItem(CLIENT_ONLY_FLAGS_STORAGE_KEY);
    return;
  }
  storageWrapper.setItem(CLIENT_ONLY_FLAGS_STORAGE_KEY, JSON.stringify(flags));
};

const defaultSettings: RemoteSettings = {
  spaciness: 'eco',
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: false,
  companionExpanded: false,
  sortingEnabled: false,
  optOutReadingStreak: false,
  optOutLevelSystem: false,
  optOutQuestSystem: false,
  // Companion is opt-in: it injects a side panel into every article page,
  // which only some users want. Default to off so new users see a clean
  // feed and can flip the toggle in the customize sidebar's Widgets
  // section if they want it.
  optOutCompanion: true,
  autoDismissNotifications: true,
  sortCommentsBy: SortCommentsBy.OldestFirst,
  showFeedbackButton: true,
  theme: remoteThemes[ThemeMode.Dark],
  campaignCtaPlacement: CampaignCtaPlacement.Header,
  flags: {
    sidebarSquadExpanded: true,
    sidebarCustomFeedsExpanded: true,
    sidebarOtherExpanded: true,
    sidebarResourcesExpanded: true,
    sidebarBookmarksExpanded: true,
    sidebarRecentExpanded: true,
    sidebarSelectedCategory: SidebarSelectedCategory.Main,
    clickbaitShieldEnabled: true,
    defaultWriteTab: WriteFormTab.NewPost,
  },
};

export const SettingsContextProvider = ({
  children,
  settings = defaultSettings,
  updateSettings,
  loadedSettings,
}: SettingsContextProviderProps): ReactElement => {
  const setTheme = useRef<ThemeMode | null>(null);
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { unsubscribePersonalizedDigest } = usePersonalizedDigest();

  useEffect(() => {
    if (!loadedSettings || setTheme.current) {
      return;
    }

    applyTheme(themeModes[settings.theme]);
  }, [settings.theme, loadedSettings]);

  const { mutateAsync: updateRemoteSettings } = useMutation<
    unknown,
    unknown,
    RemoteSettings
  >({
    mutationFn: (params) => {
      const { remote } = splitFlags(params.flags);
      const remotePayload: RemoteSettings = remote
        ? { ...params, flags: remote }
        : params;
      return gqlClient.request(UPDATE_USER_SETTINGS_MUTATION, {
        data: remotePayload,
      });
    },

    onError: (_, params) => {
      const rollback = Object.keys(params).reduce(
        (values, key) => ({ ...values, [key]: settings[key] }),
        {},
      );

      updateSettings({ ...settings, ...rollback });
    },
  });

  const applyThemeMode = useCallback(
    (mode?: ThemeMode) => {
      if (mode) {
        setTheme.current = mode;
      } else {
        setTheme.current = null;
      }

      applyTheme(setTheme.current || themeModes[settings.theme]);
    },
    [settings.theme],
  );

  useEffect(() => {
    const lightMode = storageWrapper.getItem(deprecatedLightModeStorageKey);
    if (lightMode === 'true') {
      applyTheme(ThemeMode.Light);
    }
  }, []);

  const didHydrateClientFlagsRef = useRef(false);
  useEffect(() => {
    if (didHydrateClientFlagsRef.current) {
      return;
    }
    didHydrateClientFlagsRef.current = true;
    const stored = readLocalFlags();
    const missingEntries = Object.entries(stored).filter(
      ([key]) => settings.flags?.[key as keyof SettingsFlags] === undefined,
    );
    if (!missingEntries.length) {
      return;
    }
    updateSettings({
      ...settings,
      flags: {
        ...settings.flags,
        ...Object.fromEntries(missingEntries),
      },
    });
    // Run only once on mount; we intentionally avoid re-hydrating after
    // the user mutates client-only flags.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { local } = splitFlags(settings.flags);
    writeLocalFlags(local);
  }, [settings.flags]);

  const updateRemoteSettingsFn = async (
    newSettings: RemoteSettings,
    bootUserId?: string,
  ): Promise<void> => {
    if (userId || bootUserId) {
      await updateRemoteSettings({
        ...newSettings,
      });
    }
  };

  const setSettings = async (newSettings: RemoteSettings): Promise<void> => {
    updateSettings({ ...settings, ...newSettings });
    await updateRemoteSettingsFn(newSettings);
  };

  const syncSettings = async (bootUserId?: string) => {
    await updateRemoteSettingsFn(settings, bootUserId);
  };

  const contextData = useMemo<SettingsContextData>(
    () => ({
      ...settings,
      syncSettings,
      themeMode: themeModes[settings.theme],
      setTheme: (theme: ThemeMode) =>
        setSettings({ ...settings, theme: remoteThemes[theme] }),
      toggleOpenNewTab: () =>
        setSettings({ ...settings, openNewTab: !settings.openNewTab }),
      setSpaciness: (density) =>
        setSettings({ ...settings, spaciness: density }),
      toggleInsaneMode: (insaneMode) =>
        setSettings({ ...settings, insaneMode }),
      toggleShowTopSites: () =>
        setSettings({ ...settings, showTopSites: !settings.showTopSites }),
      toggleSidebarExpanded: () =>
        setSettings({
          ...settings,
          sidebarExpanded: !settings.sidebarExpanded,
        }),
      toggleSortingEnabled: () =>
        setSettings({ ...settings, sortingEnabled: !settings.sortingEnabled }),
      toggleOptOutReadingStreak: () => {
        unsubscribePersonalizedDigest({
          type: UserPersonalizedDigestType.StreakReminder,
        });
        return setSettings({
          ...settings,
          optOutReadingStreak: !settings.optOutReadingStreak,
        });
      },
      toggleOptOutLevelSystem: () =>
        setSettings({
          ...settings,
          optOutLevelSystem: !settings.optOutLevelSystem,
        }),
      toggleOptOutQuestSystem: () =>
        setSettings({
          ...settings,
          optOutQuestSystem: !settings.optOutQuestSystem,
        }),
      toggleOptOutCompanion: () =>
        setSettings({
          ...settings,
          optOutCompanion: !settings.optOutCompanion,
        }),
      toggleAutoDismissNotifications: () =>
        setSettings({
          ...settings,
          autoDismissNotifications: !settings.autoDismissNotifications,
        }),
      toggleShowFeedbackButton: () =>
        setSettings({
          ...settings,
          showFeedbackButton: !settings.showFeedbackButton,
        }),
      onToggleHeaderPlacement: () =>
        setSettings({
          ...settings,
          campaignCtaPlacement:
            settings.campaignCtaPlacement === CampaignCtaPlacement.Header
              ? CampaignCtaPlacement.ProfileMenu
              : CampaignCtaPlacement.Header,
        }),
      loadedSettings: loadedSettings ?? false,
      updateCustomLinks: (links: string[]) =>
        setSettings({ ...settings, customLinks: links }),
      updateSortCommentsBy: (sortCommentsBy: SortCommentsBy) =>
        setSettings({ ...settings, sortCommentsBy }),
      updateFlag: <K extends keyof SettingsFlags>(
        flag: K,
        value: SettingsFlags[K],
      ) =>
        setSettings({
          ...settings,
          flags: {
            ...settings.flags,
            [flag]: value,
          },
        }),
      updateFlagRemote: <K extends keyof SettingsFlags>(
        flag: K,
        value: SettingsFlags[K],
      ) =>
        updateRemoteSettingsFn({
          ...settings,
          flags: {
            ...settings.flags,
            [flag]: value,
          },
        }),
      updatePromptFlag: (flag: keyof SettingsFlags, value: boolean) =>
        setSettings({
          ...settings,
          flags: {
            ...settings.flags,
            prompt: {
              ...settings.flags.prompt,
              [flag]: value,
            },
          },
        }),
      setSettings,
      applyThemeMode,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, loadedSettings, userId, applyThemeMode],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextData =>
  useContext(SettingsContext);
