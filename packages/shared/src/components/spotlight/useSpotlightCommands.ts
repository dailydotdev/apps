import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { ViewSize, useViewSize } from '../../hooks';
import { isExtension as isExtensionConst } from '../../lib/func';
import { getNavigateCommands } from './commands/navigate';
import { getCreateCommands } from './commands/create';
import { getSettingsCommands } from './commands/settings';
import { getActionsCommands } from './commands/actions';
import { getHelpCommands } from './commands/help';
import type { SpotlightCommand, SpotlightContextEnv } from './types';

interface UseSpotlightCommandsOptions {
  showShortcutsHelp: () => void;
}

export interface UseSpotlightCommandsResult {
  commands: SpotlightCommand[];
  env: SpotlightContextEnv;
}

/**
 * Composes every static command available to the current user. Filters out
 * commands whose `when()` predicate fails for the current env (auth, Plus,
 * extension, mobile). Auth-required commands are kept visible when logged
 * out so users discover them; their perform() will trigger the auth flow
 * via the Spotlight executor.
 */
export const useSpotlightCommands = ({
  showShortcutsHelp,
}: UseSpotlightCommandsOptions): UseSpotlightCommandsResult => {
  const router = useRouter();
  const { user, isLoggedIn, isAuthReady, logout } = useAuthContext();
  const settings = useSettingsContext();
  const { openModal } = useLazyModal();
  const { isPlus } = usePlusSubscription();
  const isMobile = !useViewSize(ViewSize.Laptop);

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

  const copyToClipboard = useCallback(async (text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(text);
  }, []);

  const commands = useMemo<SpotlightCommand[]>(() => {
    const all: SpotlightCommand[] = [
      ...getNavigateCommands({ router, user }),
      ...getCreateCommands({ router, openModal }),
      ...getSettingsCommands({ settings }),
      ...getActionsCommands({
        router,
        openModal,
        logout,
        user,
        copyToClipboard,
      }),
      ...getHelpCommands({ showShortcutsHelp }),
    ];

    return all.filter((command) => {
      if (command.when && !command.when(env)) {
        return false;
      }
      // Plus-gated commands without a `plusBadge` opt-in are hidden when the
      // user is not Plus. Commands with `plusBadge: true` stay visible as a
      // teaching aid (rendered disabled with a Plus pill).
      return true;
    });
  }, [
    router,
    user,
    openModal,
    settings,
    logout,
    copyToClipboard,
    showShortcutsHelp,
    env,
  ]);

  return { commands, env };
};
