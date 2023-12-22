import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
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

  if (searchVersion === SearchExperiment.V1) {
    return (
      <AlertPointer {...alertProps} offset={[0, 0]}>
        <Button
          className={classNames(
            'btn-tertiaryFloat mr-auto',
            shouldShowHighlightPulse && 'highlight-pulse',
          )}
          onClick={onClick}
          icon={<FilterIcon />}
        >
          Feed settings
        </Button>
      </AlertPointer>
    );
  }

  return (
    <AlertPointer {...alertProps}>
      <Button
        className={classNames(
          'btn-tertiary mr-auto',
          shouldShowHighlightPulse && 'highlight-pulse',
        )}
        onClick={onClick}
        rightIcon={<FilterIcon />}
      >
        Feed settings
      </Button>
    </AlertPointer>
  );
}

export default MyFeedHeading;
