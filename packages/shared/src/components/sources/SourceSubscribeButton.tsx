import React, { ReactElement } from 'react';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import {
  useNotificationPreference,
  checkHasStatusPreference,
} from '../../hooks/notifications';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { BellIcon, BellSubscribedIcon } from '../icons';
import { NotificationType } from '../notifications/utils';
import { SimpleTooltip } from '../tooltips';
import { Source } from '../../graphql/sources';
import { isTesting } from '../../lib/constants';
import { useToastNotification } from '../../hooks';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';
import { SourceSubscribeExperiment } from '../../lib/featureValues';

export type SourceSubscribeButtonProps = {
  className?: string;
  source: Pick<Source, 'id'>;
  variant?: ButtonVariant;
};

type SourceSubscribeButtonViewProps = {
  className?: string;
  isFetching: boolean;
  onClick: () => void;
  variant: ButtonVariant;
};

const SourceSubscribeButtonRegular = ({
  className,
  isFetching,
  variant,
  onClick,
}: SourceSubscribeButtonViewProps): ReactElement => {
  return (
    <Button
      className={className}
      variant={variant}
      icon={<BellIcon />}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
    >
      Subscribe
    </Button>
  );
};

const SourceSubscribeButtonSubscribed = ({
  className,
  isFetching,
  onClick,
}: SourceSubscribeButtonViewProps): ReactElement => {
  return (
    <SimpleTooltip forceLoad={!isTesting} content="Unsubscribe">
      <Button
        className={className}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<BellSubscribedIcon />}
        disabled={isFetching}
        onClick={onClick}
      />
    </SimpleTooltip>
  );
};

const SourceSubscribeButton = ({
  className,
  source,
  variant = ButtonVariant.Primary,
}: SourceSubscribeButtonProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const {
    preferences,
    subscribeNotification,
    clearNotificationPreference,
    isFetching,
    isPreferencesReady,
  } = useNotificationPreference({
    params: source?.id
      ? [
          {
            notificationType: NotificationType.SourcePostAdded,
            referenceId: source.id,
          },
        ]
      : undefined,
  });
  const isSubscribed = !!preferences?.some((item) =>
    checkHasStatusPreference(
      item,
      NotificationType.SourcePostAdded,
      source.id,
      [NotificationPreferenceStatus.Subscribed],
    ),
  );

  const onClick = () => {
    const notificationPreferenceParams = {
      type: NotificationType.SourcePostAdded,
      referenceId: source.id,
    };

    if (isSubscribed) {
      clearNotificationPreference(notificationPreferenceParams);
    } else {
      subscribeNotification(notificationPreferenceParams);
    }

    displayToast(
      isSubscribed
        ? '⛔️ You are now unsubscribed'
        : '✅ You are now subscribed',
    );
  };

  const ButtonComponent = isSubscribed
    ? SourceSubscribeButtonSubscribed
    : SourceSubscribeButtonRegular;

  return (
    <ButtonComponent
      className={className}
      isFetching={isFetching || !isPreferencesReady}
      onClick={onClick}
      variant={variant}
    />
  );
};

const SourceSubscribeButtonExperiment = withExperiment(SourceSubscribeButton, {
  feature: feature.sourceSubscribe,
  value: SourceSubscribeExperiment.V1,
});

export { SourceSubscribeButtonExperiment as SourceSubscribeButton };
