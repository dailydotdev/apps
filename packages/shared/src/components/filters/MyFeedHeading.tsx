import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FilterIcon } from '../icons';
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
import { useFeedLayout } from '../../hooks';

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
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const shouldHighlightFeedSettings = router.query?.hset === 'true';
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

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
    if (shouldUseFeedLayoutV1) {
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
        'bg-theme-bg-primary',
        !sidebarRendered ? 'ml-4' : null,
        shouldUseFeedLayoutV1 && '-left-20',
      ),
      wrapper: 'mr-auto',
      container: 'z-tooltip',
    },
    message: filterAlertMessage,
    placement: getPlacement(),
  };

  return (
    <AlertPointer {...alertProps}>
      <Button
        size={shouldUseFeedLayoutV1 ? ButtonSize.Small : ButtonSize.Medium}
        variant={ButtonVariant.Float}
        className={classNames(
          'mr-auto',
          shouldHighlightFeedSettings && 'highlight-pulse',
        )}
        onClick={onClick}
        icon={<FilterIcon />}
        iconPosition={
          shouldUseFeedLayoutV1 ? ButtonIconPosition.Right : undefined
        }
      >
        Feed settings
      </Button>
    </AlertPointer>
  );
}

export default MyFeedHeading;
