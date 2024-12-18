import { useRouter } from 'next/router';
import React, { ReactElement, useContext } from 'react';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { webappUrl } from '../../../lib/constants';
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
  const router = useRouter();
  const { feed, onSubmit, onDiscard, isSubmitPending, isDirty } = useContext(
    FeedSettingsEditContext,
  );
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
                router.push(`${webappUrl}feeds/${feed.id}`);
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
