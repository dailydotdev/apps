import React, { ReactElement, useContext } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { FilterIcon, RefreshIcon } from '../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';
import { setShouldRefreshFeed } from '../../lib/refreshFeed';
import { SharedFeedPage } from '../utilities';
import { useMobileUxExperiment } from '../../hooks/useMobileUxExperiment';
import ConditionalWrapper from '../ConditionalWrapper';
import { useReadingStreak } from '../../hooks/streaks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';

export const filterAlertMessage = 'Edit your personal feed preferences here';

interface MyFeedHeadingProps {
  onOpenFeedFilters: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { trackEvent } = useContext(AnalyticsContext);
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const queryClient = useQueryClient();
  const forceRefresh = useFeature(feature.forceRefresh);
  const { isNewMobileLayout } = useMobileUxExperiment();
  const { streak, isEnabled: isStreaksEnabled, isLoading } = useReadingStreak();

  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    onOpenFeedFilters();
  };

  const onRefresh = async () => {
    trackEvent({ event_name: AnalyticsEvent.RefreshFeed });
    setShouldRefreshFeed(true);
    await queryClient.refetchQueries({ queryKey: [SharedFeedPage.MyFeed] });
    setShouldRefreshFeed(false);
  };

  const isFetchingFeed =
    useIsFetching({ queryKey: [SharedFeedPage.MyFeed] }) > 0;
  const feedQueryState = queryClient.getQueryState([SharedFeedPage.MyFeed], {
    exact: false,
  });
  const isRefreshing = feedQueryState?.status === 'success' && isFetchingFeed;

  const RenderFeedActions = () => {
    return (
      <>
        {forceRefresh && (
          <Button
            size={
              shouldUseMobileFeedLayout ? ButtonSize.Small : ButtonSize.Medium
            }
            variant={ButtonVariant.Float}
            className="mr-auto"
            onClick={onRefresh}
            icon={<RefreshIcon />}
            iconPosition={
              shouldUseMobileFeedLayout ? ButtonIconPosition.Right : undefined
            }
            loading={isRefreshing}
          >
            {!isMobile && !isNewMobileLayout ? 'Refresh feed' : null}
          </Button>
        )}
        <Button
          size={
            shouldUseMobileFeedLayout ? ButtonSize.Small : ButtonSize.Medium
          }
          variant={ButtonVariant.Float}
          className="mr-auto"
          onClick={onClick}
          icon={<FilterIcon />}
          iconPosition={
            shouldUseMobileFeedLayout ? ButtonIconPosition.Right : undefined
          }
        >
          {!isMobile && !isNewMobileLayout ? 'Feed settings' : null}
        </Button>
      </>
    );
  };

  if (isNewMobileLayout) {
    return (
      <div className="flex w-full justify-between">
        {isStreaksEnabled && (
          <ReadingStreakButton streak={streak} isLoading={isLoading} />
        )}

        <div>
          <RenderFeedActions />
        </div>
      </div>
    );
  }

  return <RenderFeedActions />;
}

export default MyFeedHeading;
