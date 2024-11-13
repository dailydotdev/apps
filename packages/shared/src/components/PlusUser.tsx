import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Typography, TypographyType } from './typography/Typography';
import { DevPlusIcon } from './icons';
import { IconSize } from './Icon';
import type { WithClassNameProps } from './utilities';

type Props = {
  withText?: boolean;
  typographyType?: TypographyType;
  iconSize?: IconSize;
} & WithClassNameProps;

export const PlusUser = ({
  className,
  iconSize = IconSize.Size16,
  typographyType = TypographyType.Caption1,
  withText = true,
}: Props): ReactElement => {
  return (
    <Typography
      className={classNames('flex text-accent-bacon-default', className)}
      type={typographyType}
      bold
    >
      <DevPlusIcon secondary size={iconSize} />
      {withText && <span className="pl-0.5">Plus</span>}
    </Typography>
  );
};
