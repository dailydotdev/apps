import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Modal } from '../../modals/common/Modal';
import { ModalPropsContext } from '../../modals/common/types';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { usePlusSubscription } from '../../../hooks';
import { webappUrl } from '../../../lib/constants';
import { DevPlusIcon } from '../../icons';
import { LogEvent, TargetId } from '../../../lib/log';

export const FeedSettingsEditHeader = (): ReactElement => {
  const { onSubmit, onDiscard, isSubmitPending, isDirty, onBackToFeed } =
    useContext(FeedSettingsEditContext);
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const { isEnrolledNotPlus, logSubscriptionEvent } = usePlusSubscription();

  if (!activeView) {
    return null;
  }

  return (
    <Modal.Header
      title=""
      className="justify-between !p-4"
      showCloseButton={false}
    >
      <FeedSettingsTitle className="hidden tablet:flex" />
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
          Cancel
        </Button>
        {isEnrolledNotPlus ? (
          <Button
            tag="a"
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            href={`${webappUrl}plus`}
            icon={<DevPlusIcon className="text-action-plus-default" />}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.UpgradeSubscription,
                target_id: TargetId.CustomFeed,
              });
            }}
          >
            Upgrade to Plus
          </Button>
        ) : (
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
        )}
      </div>
    </Modal.Header>
  );
};
