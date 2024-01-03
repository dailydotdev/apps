import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import FilterIcon from '../icons/Filter';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';
import AlertPointer, {
  AlertPlacement,
  AlertPointerProps,
} from '../alert/AlertPointer';
import { filterAlertMessage } from './FeedFilters';
import { Alerts } from '../../graphql/alerts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';
import { useFeedLayout } from '../../hooks';

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
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const searchVersion = useFeature(feature.search);
  const shouldShowHighlightPulse = router.query?.hset === 'true';
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    onOpenFeedFilters();

    if (shouldShowHighlightPulse) {
      const { hset, ...query } = router.query;

      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    }
  };

  const alertProps: Omit<AlertPointerProps, 'children'> = {
    offset: sidebarRendered ? [4, 0] : [-32, 4],
    isAlertDisabled,
    onClose: () => onUpdateAlerts({ myFeed: null }),
    className: {
      label: 'w-44',
      message: classNames(
        'bg-theme-bg-primary',
        !sidebarRendered ? 'ml-4' : null,
        searchVersion === SearchExperiment.V1 && '-left-20',
      ),
      wrapper: 'mr-auto',
      container: 'z-tooltip',
    },
    message: filterAlertMessage,
    placement:
      sidebarRendered && searchVersion === SearchExperiment.Control
        ? AlertPlacement.Right
        : AlertPlacement.Bottom,
  };
  const isV1Search = searchVersion === SearchExperiment.V1;

  return (
    <AlertPointer
      {...alertProps}
      offset={isV1Search ? [0, 0] : alertProps.offset}
    >
      <Button
        size={shouldUseFeedLayoutV1 ? ButtonSize.Small : ButtonSize.Medium}
        variant={
          isV1Search || shouldUseFeedLayoutV1
            ? ButtonVariant.Float
            : ButtonVariant.Tertiary
        }
        className={classNames(
          'mr-auto',
          shouldShowHighlightPulse && 'highlight-pulse',
        )}
        onClick={onClick}
        icon={<FilterIcon />}
        iconPosition={ButtonIconPosition.Right}
      >
        Feed settings
      </Button>
    </AlertPointer>
  );
}

export default MyFeedHeading;
