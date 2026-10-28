import type { ReactElement } from 'react';
import React from 'react';
import { ModalHeader } from './ModalHeader';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { DevPlusIcon } from '../../icons';
import { IconSize } from '../../Icon';

/** A modal title with the Plus badge next to it, for Plus-only features. */
export const PlusModalTitle = ({ title }: { title: string }): ReactElement => (
  <>
    <ModalHeader.Title className="typo-title3">{title}</ModalHeader.Title>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      className="flex items-center rounded-4 bg-action-plus-float px-1"
      bold
      color={TypographyColor.Plus}
    >
      <DevPlusIcon size={IconSize.Size16} />
      Plus
    </Typography>
  </>
);
