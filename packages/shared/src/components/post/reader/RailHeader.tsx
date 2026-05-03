import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

type RailHeaderProps = {
  title: string;
  className?: string;
};

export function RailHeader({
  title,
  className,
}: RailHeaderProps): ReactElement {
  return (
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Subhead}
      className={className}
      bold
    >
      {title}
    </Typography>
  );
}
