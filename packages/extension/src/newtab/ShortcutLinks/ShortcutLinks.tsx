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
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { ContextMenu } from '@dailydotdev/shared/src/hooks/constants';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from '../MostVisitedSitesModal';
import useShortcutLinks from './useShortcutLinks';
import ShortcutOptionsMenu from './ShortcutOptionsMenu';
import { ShortcutLinksUIV1 } from './experiments/ShortcutLinksUIV1';

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}

export default function ShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement {
  const { showTopSites, toggleShowTopSites } = useContext(SettingsContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { displayToast } = useToastNotification();
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
  } = useShortcutLinks();
  const shortcutSource = isTopSiteActive
    ? ShortcutsSourceType.Browser
    : ShortcutsSourceType.Custom;

  const loggedInitialRef = useRef(false);
  const loggedRef = useRef(false);

  const { onMenuClick, isOpen } = useContextMenu({
    id: ContextMenu.ShortcutContext,
  });

  const isNewUser = true;

  useEffect(() => {
    // TODO: CHECK THE CONDITION
    if (!showTopSites || !hasCheckedPermission) {
      if (!loggedInitialRef.current) {
        loggedInitialRef.current = true;
        logEvent({
          event_name: LogEvent.Impression,
          target_type: TargetType.Shortcuts,
          extra: JSON.stringify({
            source: isNewUser
              ? ShortcutsSourceType.Placeholder
              : ShortcutsSourceType.Button,
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

  const onV1Hide = () => {
    if (!isShortcutsUIV1) {
      displayToast(
        'Get your shortcuts back by turning it on from the customize options on the sidebar',
      );
    }

    toggleShowTopSites();
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
      <ShortcutLinksUIV1
        {...{
          onLinkClick,
          onMenuClick,
          onOptionsOpen,
          onV1Hide,
          shortcutLinks,
          shouldUseListFeedLayout,
          showTopSites,
          toggleShowTopSites,
          hasCheckedPermission,
        }}
      />

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
        onHide={onV1Hide}
        onManage={onOptionsOpen}
      />
    </>
  );
}
