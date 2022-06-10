import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import PlusIcon from '@dailydotdev/shared/src/components/icons/Plus';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from './MostVisitedSitesModal';
import { CustomLinks } from './CustomLinks';
import useShortcutLinks from './useShortcutLinks';

export default function ShortcutLinks(): ReactElement {
  const { showTopSites } = useContext(SettingsContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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

  return (
    <>
      {shortcutLinks?.length ? (
        <CustomLinks
          links={shortcutLinks}
          onOptions={() => setShowOptions(true)}
        />
      ) : (
        <Button
          className="btn-tertiary"
          rightIcon={<PlusIcon />}
          onClick={() => setShowOptions(true)}
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
