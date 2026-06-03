import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { ViewSize, useViewSize } from '../../hooks';
import { isExtension as isExtensionConst } from '../../lib/func';
import type { LazyModal } from '../modals/common/types';
import {
  SpotlightActionGroup,
  type SpotlightAction,
} from '../../graphql/spotlight';
import { resolveSpotlightIcon } from './iconRegistry';
import { useSpotlight } from './SpotlightContext';
import { dispatchSpotlightAction } from './dispatcher';
import {
  type SpotlightCommand,
  type SpotlightContextEnv,
  SpotlightGroup,
} from './types';

const API_GROUP_MAP: Record<SpotlightActionGroup, SpotlightGroup> = {
  [SpotlightActionGroup.Navigate]: SpotlightGroup.Navigate,
  [SpotlightActionGroup.Create]: SpotlightGroup.Create,
  [SpotlightActionGroup.Settings]: SpotlightGroup.Settings,
  [SpotlightActionGroup.Actions]: SpotlightGroup.Actions,
  [SpotlightActionGroup.Help]: SpotlightGroup.Help,
  [SpotlightActionGroup.Search]: SpotlightGroup.Search,
};

export type UseSpotlightCommandsResult = {
  commands: SpotlightCommand[];
  env: SpotlightContextEnv;
  isLoading: boolean;
};

export const useSpotlightCommands = (): UseSpotlightCommandsResult => {
  const router = useRouter();
  const { user, isLoggedIn, isAuthReady, logout } = useAuthContext();
  const settings = useSettingsContext();
  const { openModal } = useLazyModal<LazyModal>();
  const { isPlus } = usePlusSubscription();
  const isMobile = !useViewSize(ViewSize.Laptop);
  const {
    actions: apiActions,
    isActionsLoading: isLoading,
    pushScope,
  } = useSpotlight();

  const env = useMemo<SpotlightContextEnv>(
    () => ({
      isLoggedIn,
      isAuthReady,
      isPlus,
      isExtension: isExtensionConst,
      isMobile,
    }),
    [isLoggedIn, isAuthReady, isPlus, isMobile],
  );

  const buildApiCommand = useCallback(
    (action: SpotlightAction): SpotlightCommand => ({
      id: `api.${action.id}`,
      title: action.title,
      subtitle: action.subtitle ?? undefined,
      icon: resolveSpotlightIcon(action.icon),
      keywords: action.keywords,
      group: API_GROUP_MAP[action.group],
      shortcut: action.shortcut ?? undefined,
      quickKey: action.quickKey ?? undefined,
      requiresAuth: !!action.requiresAuth,
      perform: () =>
        dispatchSpotlightAction(action, {
          router,
          openModal,
          settings,
          user,
          logout,
          pushScope,
        }),
    }),
    [router, openModal, settings, user, logout, pushScope],
  );

  const commands = useMemo<SpotlightCommand[]>(() => {
    return apiActions
      .map(buildApiCommand)
      .filter((command) => !command.when || command.when(env));
  }, [apiActions, buildApiCommand, env]);

  return { commands, env, isLoading };
};
