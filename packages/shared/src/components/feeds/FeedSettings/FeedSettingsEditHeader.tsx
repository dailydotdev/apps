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
import { FeedType } from '../../../graphql/feed';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib/labels';

const createGenericFeedPrompt: PromptOptions = {
  title: labels.feed.prompt.createGenericFeed.title,
  description: labels.feed.prompt.createGenericFeed.description,
  okButton: {
    title: labels.feed.prompt.createGenericFeed.okButton,
  },
  cancelButton: {
    title: labels.feed.prompt.createGenericFeed.cancelButton,
  },
};

const SaveButton = ({ activeView }: { activeView: string }): ReactElement => {
  const { onSubmit, isSubmitPending, isDirty, onBackToFeed, isNewFeed } =
    useContext(FeedSettingsEditContext);
  const { showPrompt } = usePrompt();

  if (isNewFeed) {
    return (
      <Button
        type="submit"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        loading={isSubmitPending}
        onClick={async () => {
          if (!isDirty) {
            const result = await showPrompt(createGenericFeedPrompt);

            if (!result) {
              return;
            }
          }

          onSubmit();
        }}
      >
        Create feed
      </Button>
    );
  }

  if (activeView !== 'General' && activeView !== 'Filters') {
    return (
      <Button
        type="submit"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={() => {
          onBackToFeed({ action: 'save' });
        }}
      >
        Save
      </Button>
    );
  }

  return (
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
  );
};

export const FeedSettingsEditHeader = (): ReactElement => {
  const { onDiscard, onBackToFeed, feed } = useContext(FeedSettingsEditContext);
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

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
              onBackToFeed({ action: 'discard' });
            }
          }}
        >
          Cancel
        </Button>
        {!isPlus && feed?.type === FeedType.Custom ? (
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
          <SaveButton activeView={activeView} />
        )}
      </div>
    </Modal.Header>
  );
};
