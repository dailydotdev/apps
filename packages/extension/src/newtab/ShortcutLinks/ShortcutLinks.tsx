import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { MostVisitedSitesModal } from '@dailydotdev/shared/src/features/shortcuts/components/modals/MostVisitedSitesModal';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useShortcutsMigration } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsMigration';
import { useIsShortcutsHubEnabled } from '@dailydotdev/shared/src/features/shortcuts/hooks/useIsShortcutsHubEnabled';
import { ShortcutLinksList } from './ShortcutLinksList';
import { ShortcutGetStarted } from './ShortcutGetStarted';
import { ShortcutLinksHub } from './ShortcutLinksHub';
import { ShortcutImportFlow } from './ShortcutImportFlow';

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}

function LegacyShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement | null {
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites, updateCustomLinks } =
    useSettingsContext();
  const { logEvent } = useLogContext();
  const {
    shortcutLinks,
    hasCheckedPermission,
    isTopSiteActive,
    showGetStarted,
    hideShortcuts,
    isManual,
  } = useShortcutLinks();

  const { showPermissionsModal } = useShortcuts();

  const shortcutSource = isTopSiteActive
    ? ShortcutsSourceType.Browser
    : ShortcutsSourceType.Custom;

  const loggedInitialRef = useRef(false);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!showTopSites || !hasCheckedPermission) {
      if (!loggedInitialRef.current) {
        loggedInitialRef.current = true;
        logEvent({
          event_name: LogEvent.Impression,
          target_type: TargetType.Shortcuts,
          extra: JSON.stringify({
            source: ShortcutsSourceType.Placeholder,
          }),
        });
      }

      return;
    }

    if (loggedRef.current) {
      return;
    }

    loggedRef.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  }, [logEvent, showTopSites, shortcutSource, hasCheckedPermission]);

  const onOptionsOpen = () => {
    if (!hasCheckedPermission) {
      return;
    }

    openModal({ type: LazyModal.CustomLinks });
  };

  const onLinkClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  };

  const onReorder = (reorderedLinks: string[]) => {
    updateCustomLinks(reorderedLinks);
  };

  if (!showTopSites) {
    return null;
  }

  return (
    <>
      {!hideShortcuts &&
        (showGetStarted ? (
          <ShortcutGetStarted
            onTopSitesClick={toggleShowTopSites}
            onCustomLinksClick={onOptionsOpen}
          />
        ) : (
          <ShortcutLinksList
            {...{
              onLinkClick,
              onOptionsOpen,
              shortcutLinks: shortcutLinks ?? [],
              shouldUseListFeedLayout,
              toggleShowTopSites,
              onReorder,
              isManual,
            }}
          />
        ))}
      {showPermissionsModal && <MostVisitedSitesModal isOpen />}
    </>
  );
}

function NewShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement | null {
  const { showTopSites, toggleShowTopSites, flags } = useSettingsContext();
  const manager = useShortcutsManager();
  const { openModal } = useLazyModal();
  useShortcutsMigration();

  if (!showTopSites) {
    return null;
  }

  // Onboarding is only shown for manual-mode users with no shortcuts yet —
  // auto mode handles its own empty state (permission CTA / no-history copy)
  // inside the hub.
  const mode = flags?.shortcutsMode ?? 'manual';
  const showOnboarding = mode === 'manual' && manager.shortcuts.length === 0;

  if (showOnboarding) {
    return (
      <>
        <ShortcutGetStarted
          onTopSitesClick={toggleShowTopSites}
          onCustomLinksClick={() =>
            openModal({ type: LazyModal.ShortcutsManage })
          }
        />
        <ShortcutImportFlow />
      </>
    );
  }

  return (
    <>
      <ShortcutLinksHub shouldUseListFeedLayout={shouldUseListFeedLayout} />
      <ShortcutImportFlow />
    </>
  );
}

export default function ShortcutLinks(props: ShortcutLinksProps): ReactElement {
  const hubEnabled = useIsShortcutsHubEnabled();

  if (hubEnabled) {
    return <NewShortcutLinks {...props} />;
  }

  return <LegacyShortcutLinks {...props} />;
}
