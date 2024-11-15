import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant, type ButtonSize } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import type { WithClassNameProps } from './utilities';
import { useViewSize, ViewSize } from '../hooks';
import { usePlusSubscription } from '../hooks/usePlusSubscription';

type Props = {
  size?: ButtonSize;
  iconOnly?: boolean;
} & WithClassNameProps;

export const UpgradeToPlus = ({
  className,
  size,
  iconOnly = false,
}: Props): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { showPlusSubscription, isPlus } = usePlusSubscription();

  const content = isMobile ? 'Upgrade' : 'Upgrade to plus';

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
      >
        {iconOnly ? null : content}
      </Button>
    </Link>
  );
};
