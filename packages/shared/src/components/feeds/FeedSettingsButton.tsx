import React, { ReactElement } from 'react';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { FilterIcon } from '../icons';

export function FeedSettingsButton(props: ButtonProps<'button'>): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { openModal } = useLazyModal();
  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    openModal({ type: LazyModal.FeedFilters, persistOnRouteChange: true });
  };

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      {...props}
      icon={<FilterIcon />}
      onClick={onClick}
    >
      Feed Settings
    </Button>
  );
}
