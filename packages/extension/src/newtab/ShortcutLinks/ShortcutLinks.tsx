import React, {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Button,
  ButtonIconPosition,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { ContextMenu } from '@dailydotdev/shared/src/hooks/constants';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { ShortcutsUIExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { useShortcuts } from '@dailydotdev/shared/src/hooks/utils';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from '../MostVisitedSitesModal';
import { CustomLinks } from '../CustomLinks';
import useShortcutLinks from './useShortcutLinks';
import ShortcutOptionsMenu from './ShortcutOptionsMenu';
import { ShortcutLinksUIV1 } from './experiments/ShortcutLinksUIV1';

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}

type ShortcutLinksControlProps = {
  className?: string;
  onLinkClick: () => void;
  onOptionsOpen: () => void;
  shortcutLinks: string[];
};

function ShortcutLinksUIControl(props: ShortcutLinksControlProps) {
  const { shortcutLinks, onLinkClick, onOptionsOpen, className } = props;
  return (
    <>
      {shortcutLinks?.length ? (
        <CustomLinks
          links={shortcutLinks}
          className={className}
          onOptions={onOptionsOpen}
          onLinkClick={onLinkClick}
        />
      ) : (
        <Button
          className={className}
          variant={ButtonVariant.Tertiary}
          icon={<PlusIcon />}
          iconPosition={ButtonIconPosition.Right}
          onClick={onOptionsOpen}
        >
          Add shortcuts
        </Button>
      )}
    </>
  );
}

export default function ShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement {
  const className = !shouldUseListFeedLayout
    ? 'ml-auto'
    : 'mt-4 w-fit mx-4 laptop:mx-0';
  const shortcutsUIFeature = useFeature(feature.shortcutsUI);
  const isShortcutsUIV1 = shortcutsUIFeature === ShortcutsUIExperiment.V1;
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

  const { isShortcutsV1 } = useShortcuts();
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
            source: isShortcutsV1
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
  }, [
    logEvent,
    showTopSites,
    shortcutSource,
    hasCheckedPermission,
    isShortcutsV1,
  ]);

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
      {isShortcutsV1 ? (
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
          }}
        />
      ) : (
        <ShortcutLinksUIControl
          {...{
            shortcutLinks,
            onLinkClick,
            onOptionsOpen,
            className,
          }}
        />
      )}

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
