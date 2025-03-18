import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import Feed from '../Feed';
import { SharedFeedPage } from '../utilities';
import { useAuthContext } from '../../contexts/AuthContext';
import { Typography, TypographyType } from '../typography/Typography';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import { FEED_QUERY, RankingAlgorithm } from '../../graphql/feed';
import { Button, ButtonVariant } from '../buttons/Button';
import { ONBOARDING_PREVIEW_KEY } from '../../contexts/InteractiveFeedContext';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { generateQueryKey } from '../../lib/query';
import { isDevelopment } from '../../lib/constants';
import { useConfetti } from '../../hooks/useConfetti';

const FeedPreviewStep = ({
  onEdit,
  onComplete,
}: {
  onEdit: () => void;
  onComplete: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const feedVersion = useFeature(feature.feedVersion);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { triggerConfetti, ConfettiCanvas } = useConfetti();

  const completeOnboarding = () => {
    onComplete();
    localStorage.setItem(ONBOARDING_PREVIEW_KEY, '');
  };

  const handleComplete = () => {
    const isMotionReduced =
      globalThis?.matchMedia(`(prefers-reduced-motion: reduce)`).matches ===
      true;

    if (isMotionReduced) {
      completeOnboarding();
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Use the center of the button as the origin
      triggerConfetti({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // Give time for the confetti animation to play
    setTimeout(completeOnboarding, 1000);
  };

  const version = isDevelopment ? 1 : feedVersion;

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <Typography bold type={TypographyType.Title3}>
          Your personalized feed is live. Well done! 🎉
        </Typography>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant={ButtonVariant.Secondary}>
            Make changes
          </Button>
          <Button
            onClick={handleComplete}
            variant={ButtonVariant.Primary}
            ref={buttonRef}
          >
            Looks great, let&apos;s go
          </Button>
        </div>
      </div>
      <ConfettiCanvas />
      <FeedLayoutProvider>
        <Feed
          feedName={SharedFeedPage.MyFeed}
          feedQueryKey={generateQueryKey(
            SharedFeedPage.MyFeed,
            user,
            version,
            RankingAlgorithm.Popularity,
          )}
          query={FEED_QUERY}
          variables={{
            ranking: RankingAlgorithm.Popularity,
            version,
            first: 25,
            loggedIn: true,
          }}
          showSearch={false}
          options={{ refetchOnMount: true }}
          disableAds
        />
      </FeedLayoutProvider>
    </div>
  );
};

export default FeedPreviewStep;
