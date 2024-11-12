import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Typography, TypographyType } from './typography/Typography';
import { DevPlusIcon } from './icons';
import { IconSize } from './Icon';
import type { WithClassNameProps } from './utilities';

type Props = {
  withText: boolean;
} & WithClassNameProps;

export const PlusUser = ({
  className,
  withText = true,
}: Props): ReactElement => {
  return (
    <Typography
      className={classNames('flex text-accent-bacon-default', className)}
      type={TypographyType.Caption1}
      bold
    >
      <DevPlusIcon secondary size={IconSize.Size16} />
      {withText && <span className="pl-0.5">Plus</span>}
    </Typography>
  );
};
