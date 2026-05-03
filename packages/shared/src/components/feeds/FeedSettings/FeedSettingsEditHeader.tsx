import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { ButtonV2 } from '../../buttons/ButtonV2';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Modal } from '../../modals/common/Modal';
import { ModalPropsContext } from '../../modals/common/types';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { useConditionalFeature, usePlusSubscription } from '../../../hooks';
import { DevPlusIcon } from '../../icons';
import { LogEvent, TargetId } from '../../../lib/log';
import { FeedType } from '../../../graphql/feed';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib/labels';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';

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
      <ButtonV2
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
      </ButtonV2>
    );
  }

  if (activeView !== 'General' && activeView !== 'Filters') {
    return (
      <ButtonV2
        type="submit"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={() => {
          onBackToFeed({ action: 'save' });
        }}
      >
        Save
      </ButtonV2>
    );
  }

  return (
    <ButtonV2
      type="submit"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      loading={isSubmitPending}
      onClick={onSubmit}
      disabled={!isDirty}
    >
      Save
    </ButtonV2>
  );
};

export const FeedSettingsEditHeader = (): ReactElement => {
  const { onDiscard, onBackToFeed, feed, onSubmit } = useContext(
    FeedSettingsEditContext,
  );
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

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
        <ButtonV2
          type="button"
          size={ButtonSize.Small}
          variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
          onClick={async () => {
            const shouldDiscard = await onDiscard({ activeView });

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
        </ButtonV2>
        {!isPlus && feed?.type === FeedType.Custom ? (
          <ButtonV2
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<DevPlusIcon className="text-action-plus-default" />}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.UpgradeSubscription,
                target_id: TargetId.CustomFeed,
              });

              onSubmit();
            }}
          >
            {plusCta}
          </ButtonV2>
        ) : (
          <SaveButton activeView={activeView} />
        )}
      </div>
    </Modal.Header>
  );
};
