import React, {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import PlusIcon from '@dailydotdev/shared/src/components/icons/Plus';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
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
  } = useShortcutLinks();

  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }

    mountedRef.current = true;

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.Shortcuts,
    });
  }, [trackEvent]);

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
            });
          }}
        />
      ) : (
        <Button
          className={classNames('btn-tertiary', className)}
          rightIcon={<PlusIcon />}
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
