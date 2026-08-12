import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { plusSaleLabelBg } from '../../styles/custom';
import { usePlusSale } from '../../hooks/usePlusSale';
import type { WithClassNameProps } from '../utilities/common';

export function PlusSaleLabel({
  className,
}: WithClassNameProps): ReactElement | null {
  const { isActive, label } = usePlusSale();

  if (!isActive || !label) {
    return null;
  }

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      className={classNames(
        'whitespace-nowrap rounded-6 px-1.5 py-0.5 text-black',
        className,
      )}
      style={{ background: plusSaleLabelBg }}
      bold
    >
      {label}
    </Typography>
  );
}
