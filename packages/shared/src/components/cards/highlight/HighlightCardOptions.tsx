import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BellAddIcon, BellSubscribedIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMajorHeadlinesSubscription } from '../../../hooks/notifications/useMajorHeadlinesSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureMajorHeadlinesPush } from '../../../lib/featureManagement';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { HighlightSignificance } from '../../../graphql/highlights';

const NOTIFICATION_SETTINGS_PATH = '/settings/notifications';

interface HighlightCardOptionsProps {
  channel?: string;
  className?: string;
}

const HighlightCardOptionsContent = ({
  channel,
  className,
}: HighlightCardOptionsProps & { channel: string }): ReactElement => {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const { displayToast } = useToastNotification();
  const {
    isChannelSubscribed,
    isLoading,
    isPending,
    subscribeChannel,
    unsubscribeChannel,
  } = useMajorHeadlinesSubscription();

  const isSubscribed = isChannelSubscribed(channel);

  const handleToggle = async () => {
    if (isToggling || isLoading || isPending) {
      return;
    }
    setIsToggling(true);
    try {
      if (isSubscribed) {
        await unsubscribeChannel(channel, 'feed_card');
        displayToast('Real-time alerts turned off.');
        return;
      }
      await subscribeChannel(channel, HighlightSignificance.Major, 'feed_card');
      displayToast("You'll be the first to know when news breaks.", {
        action: {
          copy: 'Settings',
          onClick: () => router.push(NOTIFICATION_SETTINGS_PATH),
        },
      });
    } finally {
      setIsToggling(false);
    }
  };

  const label = isSubscribed
    ? 'Turn off real-time alerts'
    : 'Get real-time alerts';
  const Icon = isSubscribed ? BellSubscribedIcon : BellAddIcon;

  return (
    <Tooltip content={label}>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<Icon />}
        className={classNames(
          'invisible my-auto group-hover:visible',
          className,
        )}
        aria-label={label}
        onClick={handleToggle}
        disabled={isToggling || isLoading || isPending}
      />
    </Tooltip>
  );
};

export const HighlightCardOptions = ({
  channel,
  className,
}: HighlightCardOptionsProps): ReactElement | null => {
  const auth = useAuthContext();
  const user = auth?.user;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureMajorHeadlinesPush,
    shouldEvaluate: !!user,
  });

  if (!isFeatureEnabled || !user || !channel) {
    return null;
  }

  return (
    <HighlightCardOptionsContent channel={channel} className={className} />
  );
};

export default HighlightCardOptions;
