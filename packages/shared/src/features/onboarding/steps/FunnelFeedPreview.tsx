import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import type { FunnelStepFeedPreview } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import Feed from '../../../components/Feed';
import { ANONYMOUS_FEED_QUERY, RankingAlgorithm } from '../../../graphql/feed';
import { OtherFeedPage, RequestKey } from '../../../lib/query';
import { FeedLayoutProvider } from '../../../contexts/FeedContext';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { ButtonSize } from '../../../components/buttons/common';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { MoveToIcon } from '../../../components/icons';
import { useConditionalFeature } from '../../../hooks';
import { popularFeedVersion } from '../../../lib/featureManagement';

function InteractionPrompt({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}): ReactElement | null {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={classNames(
        'fixed inset-x-0 bottom-32 z-max mx-auto w-fit',
        'animate-bounce rounded-16 bg-surface-float px-4 py-2 shadow-2',
        'transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
      >
        {message}
      </Typography>
    </div>
  );
}

function FeedPreviewComponent({
  onTransition,
}: FunnelStepFeedPreview): ReactElement {
  const { value: feedVersion } = useConditionalFeature({
    feature: popularFeedVersion,
    shouldEvaluate: true,
  });

  const feedVariables = {
    ranking: RankingAlgorithm.Popularity,
    version: feedVersion,
  };

  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(
    null,
  );

  const showPrompt = useCallback((message: string) => {
    setInteractionPrompt(message);
    setTimeout(() => setInteractionPrompt(null), 2500);
  }, []);

  return (
    <div
      className="relative flex flex-1 flex-col"
      data-testid="funnel-feed-preview"
    >
      {/* Minimal top bar */}
      <div className="sticky top-0 z-3 flex items-center justify-between px-4 py-3">
        <Logo linkDisabled position={LogoPosition.Empty} />
        <button
          type="button"
          className="flex items-center gap-1 text-text-tertiary transition-colors hover:text-text-primary"
          onClick={() =>
            onTransition({ type: FunnelStepTransitionType.Complete })
          }
        >
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Personalize
          </Typography>
          <MoveToIcon className="size-5" />
        </button>
      </div>

      {/* Feed */}
      <div
        className="relative flex-1"
        role="presentation"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement;
          const button = target.closest(
            '[data-testid="upvoteBtn"], [data-testid="bookmarkBtn"], [data-testid="commentBtn"]',
          );
          if (button) {
            e.preventDefault();
            e.stopPropagation();
            const action = button
              .getAttribute('data-testid')
              ?.replace('Btn', '');
            showPrompt(`Create a free account to ${action}`);
          }
        }}
      >
        <FeedLayoutProvider>
          <Feed
            className="px-4"
            feedName={OtherFeedPage.Preview}
            feedQueryKey={[RequestKey.FeedPreview, 'onboarding-mockup']}
            query={ANONYMOUS_FEED_QUERY}
            variables={feedVariables}
            showSearch={false}
            disableAds
            allowFetchMore={false}
          />
        </FeedLayoutProvider>
      </div>

      {/* Gradient fade at bottom */}
      <div className="via-background-default/80 pointer-events-none fixed inset-x-0 bottom-0 z-3 h-40 bg-gradient-to-t from-background-default to-transparent" />

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-3 flex justify-center p-4 pb-safe-or-4">
        <div className="bg-background-default/80 w-full max-w-md rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-xl">
          <Button
            className="group w-full overflow-hidden"
            onClick={() =>
              onTransition({ type: FunnelStepTransitionType.Complete })
            }
            size={ButtonSize.XLarge}
            variant={ButtonVariant.Primary}
          >
            <span className="relative z-1">Personalize your feed</span>
            <MoveToIcon className="relative z-1 ml-1 size-5 transition-transform group-hover:translate-x-0.5" />
            {/* Shimmer effect on hover */}
            <span className="via-white/20 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Button>
        </div>
      </div>

      <InteractionPrompt
        message={interactionPrompt ?? ''}
        visible={!!interactionPrompt}
      />
    </div>
  );
}

export const FunnelFeedPreview = withIsActiveGuard(FeedPreviewComponent);
