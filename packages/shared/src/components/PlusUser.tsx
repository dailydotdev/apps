import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Typography, TypographyType } from './typography/Typography';
import { DevPlusIcon } from './icons';
import { IconSize } from './Icon';
import type { WithClassNameProps } from './utilities';

export const PlusUser = ({ className }: WithClassNameProps): ReactElement => {
  return (
    <Typography
      className={classNames('flex text-accent-bacon-default', className)}
      type={TypographyType.Caption1}
      bold
    >
      <DevPlusIcon secondary size={IconSize.Size16} />
      <span className="pl-0.5">Plus</span>
    </Typography>
  );
};
