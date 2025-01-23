import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { ButtonSize, ButtonColor } from './buttons/Button';
import { Button, ButtonVariant } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import { useViewSize, ViewSize } from '../hooks';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import type { TargetId } from '../lib/log';
import { LogEvent } from '../lib/log';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';
import type { WithClassNameProps } from './utilities';

type Props = {
  iconOnly?: boolean;
  target: TargetId;
  size?: ButtonSize;
  variant?: ButtonVariant;
  color?: ButtonColor;
} & WithClassNameProps;

export const UpgradeToPlus = ({
  className,
  color,
  size,
  iconOnly = false,
  target,
  variant,
  ...attrs
}: Props): ReactElement => {
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.LaptopXL);
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  const content = isLaptop ? 'Upgrade to Plus' : 'Upgrade';

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isLoggedIn) {
        e.preventDefault();
        showLogin({ trigger: AuthTriggers.Plus });
        return;
      }

      logSubscriptionEvent({
        event_name: LogEvent.UpgradeSubscription,
        target_id: target,
      });
    },
    [isLoggedIn, logSubscriptionEvent, showLogin, target],
  );

  if (isPlus) {
    return null;
  }

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        className={classNames(
          !color && 'border-action-plus-default text-action-plus-default',
          !iconOnly && 'flex-1',
          className,
        )}
        icon={<DevPlusIcon />}
        size={size}
        onClick={onClick}
        {...(variant && { variant, color })}
        {...attrs}
      >
        {iconOnly ? null : content}
      </Button>
    </Link>
  );
};
