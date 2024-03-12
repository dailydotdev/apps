import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { FilterIcon, RefreshIcon } from '../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import AlertPointer, {
  AlertPlacement,
  AlertPointerProps,
  OffsetXY,
} from '../alert/AlertPointer';
import { Alerts } from '../../graphql/alerts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';
import { setShouldRefreshFeed } from '../../lib/refreshFeed';
import { SharedFeedPage } from '../utilities';

export const filterAlertMessage = 'Edit your personal feed preferences here';

interface MyFeedHeadingProps {
  isAlertDisabled: boolean;
  sidebarRendered: boolean;
  onOpenFeedFilters: () => void;
  onUpdateAlerts: (alerts: Alerts) => void;
}

function MyFeedHeading({
  isAlertDisabled,
  sidebarRendered,
  onUpdateAlerts,
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const shouldHighlightFeedSettings = router.query?.hset === 'true';
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const queryClient = useQueryClient();
  const forceRefresh = useFeature(feature.forceRefresh);

  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    onOpenFeedFilters();

    if (shouldHighlightFeedSettings) {
      const { hset, ...query } = router.query;

      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    }
  };

  const getPlacement = () => {
    return AlertPlacement.Bottom;
  };

  const getOffset = (): OffsetXY => {
    if (shouldUseMobileFeedLayout) {
      return [0, 8];
    }

    return [0, 0];
  };

  const alertProps: Omit<AlertPointerProps, 'children'> = {
    offset: getOffset(),
    isAlertDisabled: shouldHighlightFeedSettings ? isAlertDisabled : true,
    onClose: () => onUpdateAlerts({ myFeed: null }),
    className: {
      label: 'w-44',
      message: classNames(
        'bg-background-default',
        !sidebarRendered ? 'ml-4' : null,
        shouldUseMobileFeedLayout && '-left-20',
      ),
      wrapper: 'mr-auto',
      container: 'z-tooltip',
    },
    message: filterAlertMessage,
    placement: getPlacement(),
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
          {!isMobile ? 'Refresh feed' : null}
        </Button>
      )}
      <AlertPointer {...alertProps}>
        <Button
          size={
            shouldUseMobileFeedLayout ? ButtonSize.Small : ButtonSize.Medium
          }
          variant={ButtonVariant.Float}
          className={classNames(
            'mr-auto',
            shouldHighlightFeedSettings && 'highlight-pulse',
          )}
          onClick={onClick}
          icon={<FilterIcon />}
          iconPosition={
            shouldUseMobileFeedLayout ? ButtonIconPosition.Right : undefined
          }
        >
          {!isMobile ? 'Feed settings' : null}
        </Button>
      </AlertPointer>
    </>
  );
}

export default MyFeedHeading;
