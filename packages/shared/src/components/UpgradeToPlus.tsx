import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant, type ButtonSize } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import type { WithClassNameProps } from './utilities';
import { useViewSize, ViewSize } from '../hooks';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';

type Props = {
  size?: ButtonSize;
  iconOnly?: boolean;
  target: TargetId;
} & WithClassNameProps;

export const UpgradeToPlus = ({
  className,
  size,
  iconOnly = false,
  target,
}: Props): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { showPlusSubscription, isPlus, logSubscriptionEvent } =
    usePlusSubscription();

  const content = isMobile ? 'Upgrade' : 'Upgrade to plus';

  const onClick = useCallback(() => {
    logSubscriptionEvent(LogEvent.UpgradeSubscription, target);
  }, [logSubscriptionEvent, target]);

  if (!showPlusSubscription || isPlus) {
    return null;
  }

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        className={classNames(
          'border-action-plus-default text-action-plus-default',
          !iconOnly && 'flex-1',
          className,
        )}
        icon={<DevPlusIcon />}
        size={size}
        onClick={onClick}
      >
        {iconOnly ? null : content}
      </Button>
    </Link>
  );
};
