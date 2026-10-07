import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { Button } from '../../buttons/Button';
import { ShellSquare } from '../../shell/ShellSquare';
import {
  goBackPast,
  isFeedEditPath,
  isSettingsPath,
} from '../../shell/shellNav';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { IconSize } from '../../Icon';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Modal } from '../../modals/common/Modal';
import { ModalPropsContext } from '../../modals/common/types';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib/labels';
import { useConditionalFeature, usePlusSubscription } from '../../../hooks';
import { ArrowIcon, DevPlusIcon } from '../../icons';
import { LogEvent, TargetId } from '../../../lib/log';
import { FeedType } from '../../../graphql/feed';
import {
  FeedChipsVariant,
  featureFeedChips,
  featurePlusCtaCopy,
} from '../../../lib/featureManagement';

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

export const FeedSettingsEditHeader = (): ReactElement | null => {
  const { onDiscard, onBackToFeed, feed, onSubmit } = useContext(
    FeedSettingsEditContext,
  );
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const queryClient = useQueryClient();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !isPlus,
  });
  const isFeedChipsEnabled = feedChipsVariant !== FeedChipsVariant.None;
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus && !isFeedChipsEnabled,
  });

  // Pre-chips behavior: non-Plus on Custom feeds saw a forced Plus CTA in
  // place of Save. Once the chips feature is on, free users get a working
  // SaveButton (advanced sections still self-upsell via FeedSettingsPlusGate).
  const showPlusCta =
    !isFeedChipsEnabled && !isPlus && feed?.type === FeedType.Custom;

  const saveNode = showPlusCta ? (
    <Button
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
    </Button>
  ) : (
    activeView && <SaveButton activeView={activeView} />
  );

  // On a phone the modal covers the block, so it draws the block's page
  // row itself: back (to the sections menu, then to the feed), the name,
  // Save.
  if (isMobile) {
    const feedName =
      feed?.type === FeedType.Custom
        ? feed.flags?.name ?? 'Feed settings'
        : 'For You';
    const rowTitle = activeView ?? feedName;

    return (
      <div className="flex h-[3.25rem] w-full shrink-0 items-center gap-2 px-4">
        <ShellSquare
          aria-label="Go back"
          onClick={async () => {
            if (!activeView) {
              const target = goBackPast(isFeedEditPath, () =>
                onBackToFeed({ action: 'discard' }),
              );
              if (target && isSettingsPath(target)) {
                queryClient.setQueryData(
                  generateQueryKey(RequestKey.AccountNavigation),
                  true,
                );
              }
              return;
            }
            const shouldDiscard = await onDiscard({ activeView });
            if (shouldDiscard) {
              setActiveView?.(undefined);
            }
          }}
        >
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </ShellSquare>
        <h1 className="min-w-0 flex-1 truncate px-1 font-bold typo-title3">
          {rowTitle}
        </h1>
        {activeView && (
          <div className="flex items-center gap-2 [&_.btn]:!h-[2.375rem] [&_.btn]:!rounded-14">
            {saveNode}
          </div>
        )}
      </div>
    );
  }

  if (!activeView) {
    return null;
  }

  const actions = (
    <div className="flex w-full justify-between gap-2 tablet:w-auto tablet:justify-start">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        onClick={async () => {
          const shouldDiscard = await onDiscard({ activeView });

          if (!shouldDiscard) {
            return;
          }

          onBackToFeed({ action: 'discard' });
        }}
      >
        Cancel
      </Button>
      {saveNode}
    </div>
  );

  return (
    <Modal.Header
      title=""
      className="justify-between !p-4"
      showCloseButton={false}
    >
      <FeedSettingsTitle className="hidden tablet:flex" />
      {actions}
    </Modal.Header>
  );
};
