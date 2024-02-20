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
import { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/analytics';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from './MostVisitedSitesModal';
import { CustomLinks } from './CustomLinks';
import useShortcutLinks from './useShortcutLinks';

export default function ShortcutLinks({
  className,
}: WithClassNameProps): ReactElement {
  const { showTopSites } = useContext(SettingsContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { trackEvent } = useContext(AnalyticsContext);
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

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!showTopSites || !hasCheckedPermission) {
      return;
    }

    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  }, [trackEvent, showTopSites, shortcutSource, hasCheckedPermission]);

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

  const onOptionsOpen = () => {
    setShowOptions(true);

    trackEvent({
      event_name: AnalyticsEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });
  };

  return (
    <>
      {shortcutLinks?.length ? (
        <CustomLinks
          links={shortcutLinks}
          className={className}
          onOptions={onOptionsOpen}
          onLinkClick={() => {
            trackEvent({
              event_name: AnalyticsEvent.Click,
              target_type: TargetType.Shortcuts,
              extra: JSON.stringify({ source: shortcutSource }),
            });
          }}
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
    </>
  );
}
