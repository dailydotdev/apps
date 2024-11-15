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
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../lib/log';

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
  const { showPlusSubscription, isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();

  const content = isMobile ? 'Upgrade' : 'Upgrade to plus';

  const onClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_type: TargetType.Plus,
      target_id: target,
    });
  }, [logEvent, target]);

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
