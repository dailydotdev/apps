import React, {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';

import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { ContextMenu } from '@dailydotdev/shared/src/hooks/constants';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from '../MostVisitedSitesModal';
import useShortcutLinks from './useShortcutLinks';
import ShortcutOptionsMenu from './ShortcutOptionsMenu';
import { ShortcutLinksList } from './ShortcutLinksList';
import { ShortcutLinksBanner } from './ShortcutLinksBanner';

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}

export default function ShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement {
  const { showTopSites, toggleShowTopSites } = useContext(SettingsContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { logEvent } = useContext(LogContext);
  const {
    askTopSitesPermission,
    revokePermission,
    onIsManual,
    resetSelected,
    shortcutLinks,
    formLinks = [],
    hasTopSites,
    hasCheckedPermission,
    isManual,
    formRef,
    onSaveChanges,
    isTopSiteActive,
    haveEnabledShortcuts,
  } = useShortcutLinks();
  const shortcutSource = isTopSiteActive
    ? ShortcutsSourceType.Browser
    : ShortcutsSourceType.Custom;

  const loggedInitialRef = useRef(false);
  const loggedRef = useRef(false);

  const { onMenuClick, isOpen } = useContextMenu({
    id: ContextMenu.ShortcutContext,
  });

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
    setShowOptions(true);

    logEvent({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });
  };

  if (!showTopSites) {
    return <></>;
  }

  const onShowTopSites = () => {
    if (hasTopSites === null) {
      setShowModal(true);
    }

    onIsManual(false);
  };

  const onSubmit = async (e: FormEvent) => {
    const { errors } = await onSaveChanges(e);

    if (errors) {
      return;
    }

    setShowOptions(false);
  };

  const onLinkClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  };

  return (
    <>
      {hasCheckedPermission &&
        (haveEnabledShortcuts ? (
          <ShortcutLinksList
            {...{
              onLinkClick,
              onMenuClick,
              onOptionsOpen,
              shortcutLinks,
              shouldUseListFeedLayout,
              showTopSites,
              toggleShowTopSites,
              hasCheckedPermission,
            }}
          />
        ) : (
          <ShortcutLinksBanner
            onTopSitesClick={toggleShowTopSites}
            onCustomLinksClick={onOptionsOpen}
          />
        ))}

      {showModal && (
        <MostVisitedSitesModal
          isOpen={showModal}
          onRequestClose={() => {
            setShowModal(false);
            onIsManual(true);
          }}
          onApprove={async () => {
            setShowModal(false);
            const granted = await askTopSitesPermission();
            if (!granted) {
              onIsManual(true);
            }
          }}
        />
      )}
      {showOptions && hasCheckedPermission && (
        <CustomLinksModal
          onSubmit={onSubmit}
          formRef={formRef}
          isOpen={showOptions}
          isManual={isManual}
          links={formLinks}
          onRevokePermission={revokePermission}
          onShowPermission={() => setShowModal(true)}
          onRequestClose={() => {
            setShowOptions(false);
            resetSelected();
          }}
          onShowCustomLinks={() => onIsManual(true)}
          onShowTopSitesClick={onShowTopSites}
        />
      )}
      <ShortcutOptionsMenu
        isOpen={isOpen}
        onHide={toggleShowTopSites}
        onManage={onOptionsOpen}
      />
    </>
  );
}
