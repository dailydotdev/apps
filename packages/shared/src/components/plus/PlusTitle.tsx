import type { ReactElement } from 'react';
import React from 'react';
import classnames from 'classnames';
import type { TypographyProps, AllowedTags } from '../typography/Typography';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon } from '../icons';
import { IconSize } from '../Icon';

export function PlusTitle(
  typography: TypographyProps<AllowedTags> = {},
): ReactElement {
  const { className } = typography;

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={TypographyColor.Plus}
      {...typography}
      className={classnames('flex flex-row items-center gap-0.5', className)}
    >
      <DevPlusIcon size={IconSize.Size16} /> Plus
    </Typography>
  );
}
