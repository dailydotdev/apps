import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Modal } from '../../modals/common/Modal';
import { ModalPropsContext } from '../../modals/common/types';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { feedSettingsMenuTitle } from './types';

// for now only some views have save button
// on other views settings are auto saved
const viewsWithSaveButton = new Set([
  feedSettingsMenuTitle.general,
  feedSettingsMenuTitle.filters,
]);

export const FeedSettingsEditHeader = (): ReactElement => {
  const { onSubmit, onDiscard, isSubmitPending, isDirty, onBackToFeed } =
    useContext(FeedSettingsEditContext);
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);

  const viewHasSaveButton = viewsWithSaveButton.has(activeView);

  if (!activeView) {
    return null;
  }

  return (
    <Modal.Header
      title=""
      className="justify-between !p-4"
      showCloseButton={!viewHasSaveButton}
    >
      <FeedSettingsTitle className="hidden tablet:flex" />
      {viewHasSaveButton && (
        <div className="flex w-full justify-between gap-2 tablet:w-auto tablet:justify-start">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
            onClick={async () => {
              const shouldDiscard = await onDiscard();

              if (!shouldDiscard) {
                return;
              }

              if (isMobile) {
                setActiveView(undefined);
              } else {
                onBackToFeed();
              }
            }}
          >
            {isMobile ? 'Cancel' : 'Discard'}
          </Button>
          <Button
            type="submit"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            loading={isSubmitPending}
            onClick={onSubmit}
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>
      )}
    </Modal.Header>
  );
};
