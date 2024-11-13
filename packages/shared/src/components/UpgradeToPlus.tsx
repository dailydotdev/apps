import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant, type ButtonSize } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import type { WithClassNameProps } from './utilities';
import { useViewSize, ViewSize } from '../hooks';

type Props = {
  size?: ButtonSize;
} & WithClassNameProps;

export const UpgradeToPlus = ({ className, size }: Props): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        className={classNames(
          'flex-1 border-accent-bacon-default text-accent-bacon-default',
          className,
        )}
        icon={<DevPlusIcon />}
        size={size}
      >
        {isMobile ? 'Plus' : 'Upgrade to plus'}
      </Button>
    </Link>
  );
};
