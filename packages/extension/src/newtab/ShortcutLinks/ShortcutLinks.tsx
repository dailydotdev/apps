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
import { ShortcutLinksList } from './ShortcutLinksList';
import { ShortcutGetStarted } from './ShortcutGetStarted';

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}

export default function ShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement {
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites } = useSettingsContext();
  const { logEvent } = useLogContext();
  const {
    shortcutLinks,
    hasCheckedPermission,
    isTopSiteActive,
    showGetStarted,
    hideShortcuts,
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

  if (!showTopSites) {
    return <></>;
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
              shortcutLinks,
              shouldUseListFeedLayout,
              showTopSites,
              toggleShowTopSites,
              hasCheckedPermission,
            }}
          />
        ))}
      {showPermissionsModal && <MostVisitedSitesModal isOpen />}
    </>
  );
}
