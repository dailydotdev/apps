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

const NOTIFICATION_SETTINGS_PATH = '/settings/notifications';

interface HighlightCardOptionsProps {
  className?: string;
}

const HighlightCardOptionsContent = ({
  className,
}: HighlightCardOptionsProps): ReactElement => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { displayToast } = useToastNotification();
  const { isSubscribed, isLoading, subscribe, unsubscribe } =
    useMajorHeadlinesSubscription();

  const handleToggle = async () => {
    if (isPending || isLoading) {
      return;
    }
    setIsPending(true);
    try {
      if (isSubscribed) {
        await unsubscribe('feed_card');
        displayToast('Real-time alerts turned off.');
        return;
      }
      await subscribe('feed_card');
      displayToast("You'll be the first to know when news breaks.", {
        action: {
          copy: 'Settings',
          onClick: () => router.push(NOTIFICATION_SETTINGS_PATH),
        },
      });
    } finally {
      setIsPending(false);
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
        disabled={isPending || isLoading}
      />
    </Tooltip>
  );
};

export const HighlightCardOptions = ({
  className,
}: HighlightCardOptionsProps): ReactElement | null => {
  const auth = useAuthContext();
  const user = auth?.user;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureMajorHeadlinesPush,
    shouldEvaluate: !!user,
  });

  if (!isFeatureEnabled || !user) {
    return null;
  }

  return <HighlightCardOptionsContent className={className} />;
};

export default HighlightCardOptions;
