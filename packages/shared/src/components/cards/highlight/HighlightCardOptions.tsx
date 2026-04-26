import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import {
  BellAddIcon,
  BellSubscribedIcon,
  MenuIcon as RawMenuIcon,
} from '../../icons';
import { MenuIcon } from '../../MenuIcon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMajorHeadlinesSubscription } from '../../../hooks/notifications/useMajorHeadlinesSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureMajorHeadlinesPush } from '../../../lib/featureManagement';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { MenuItemProps } from '../../dropdown/common';

interface HighlightCardOptionsProps {
  className?: string;
}

const HighlightCardOptionsContent = ({
  className,
}: HighlightCardOptionsProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const { displayToast } = useToastNotification();
  const { isSubscribed, subscribe, unsubscribe } =
    useMajorHeadlinesSubscription();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe('feed_card');
      displayToast('Real-time alerts turned off.');
      return;
    }
    await subscribe('feed_card');
    displayToast("You'll be the first to know when news breaks.");
  };

  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={isSubscribed ? BellSubscribedIcon : BellAddIcon} />,
      label: isSubscribed
        ? 'Turn off real-time alerts'
        : 'Get real-time alerts',
      action: handleToggle,
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<RawMenuIcon />}
          className={classNames('my-auto', className)}
          aria-label="Highlight options"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
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
