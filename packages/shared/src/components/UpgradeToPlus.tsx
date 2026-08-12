import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { ButtonSize } from './buttons/Button';
import { ButtonColor, Button, ButtonVariant } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import { useViewSize, ViewSize } from '../hooks';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { usePlusSale } from '../hooks/usePlusSale';
import type { TargetId } from '../lib/log';
import { LogEvent } from '../lib/log';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';
import type { WithClassNameProps } from './utilities';
import { PlusSaleLabel } from './plus/PlusSaleLabel';

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
}: Props): ReactElement | null => {
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const isFullCTAText = !isLaptop || isLaptopXL;
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { isActive: isSaleActive } = usePlusSale();
  const ctaCopy = { full: 'Get API Access', short: 'API access' };
  const content = isFullCTAText ? ctaCopy.full : ctaCopy.short;
  const showSaleLabel = isSaleActive && !iconOnly;
  const defaultColor = ButtonColor.Bacon;

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
        className={classNames(!iconOnly && 'flex-1', className)}
        icon={<DevPlusIcon />}
        size={size}
        color={defaultColor}
        variant={ButtonVariant.Primary}
        onClick={onClick}
        {...(variant && { variant, color })}
        {...attrs}
      >
        {showSaleLabel ? (
          // Button only auto-wraps its label when every child is text, so the
          // label span is reproduced here to keep truncation once the badge
          // turns the children into elements.
          <>
            <span className="btn-label min-w-0 truncate">{content}</span>
            <PlusSaleLabel />
          </>
        ) : (
          !iconOnly && content
        )}
      </Button>
    </Link>
  );
};
