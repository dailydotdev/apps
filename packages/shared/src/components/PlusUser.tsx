import React from 'react';
import type { ReactElement } from 'react';
import { Typography, TypographyType } from './typography/Typography';
import { DevPlusIcon } from './icons';
import { IconSize } from './Icon';

export const PlusUser = (): ReactElement => {
  return (
    <Typography
      className="flex text-accent-bacon-default"
      type={TypographyType.Caption1}
      bold
    >
      <DevPlusIcon secondary size={IconSize.Size16} />
      <span className="pl-0.5">Plus</span>
    </Typography>
  );
};
