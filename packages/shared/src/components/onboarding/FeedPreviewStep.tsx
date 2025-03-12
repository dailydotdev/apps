import type { ReactElement } from 'react';
import React from 'react';
import Feed from '../Feed';
import { SharedFeedPage } from '../utilities';
import { useAuthContext } from '../../contexts/AuthContext';
import { Typography, TypographyType } from '../typography/Typography';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import { FEED_QUERY } from '../../graphql/feed';
import { Button, ButtonVariant } from '../buttons/Button';
import { useOnboarding } from '../../hooks/auth';
import { ActionType } from '../../graphql/actions';
import { ONBOARDING_PREVIEW_KEY } from '../../contexts/InteractiveFeedContext';

const FeedPreviewStep = ({
  onEdit,
  onComplete,
}: {
  onEdit: () => void;
  onComplete: () => void;
}): ReactElement => {
  const { completeStep } = useOnboarding();
  const { user } = useAuthContext();

  const handleComplete = () => {
    // TODO: Add some confetti
    completeStep(ActionType.EditTag);
    onComplete();
    localStorage.setItem(ONBOARDING_PREVIEW_KEY, '');
  };

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
          <Button onClick={handleComplete} variant={ButtonVariant.Primary}>
            Looks great, let&apos;s go
          </Button>
        </div>
      </div>
      <FeedLayoutProvider>
        <Feed
          feedName={SharedFeedPage.MyFeed}
          feedQueryKey={[SharedFeedPage.MyFeed, user?.id]}
          query={FEED_QUERY}
          showSearch={false}
          options={{ refetchOnMount: true }}
          disableAds
        />
      </FeedLayoutProvider>
    </div>
  );
};

export default FeedPreviewStep;
