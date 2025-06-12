import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type BriefListHeadingProps = {
  className?: string;
  title: ReactNode;
};

export const BriefListHeading = ({
  className,
  title,
}: BriefListHeadingProps): ReactElement => {
  return (
    <article
      className={classNames('flex w-full items-center gap-4 p-4', className)}
    >
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Quaternary}
      >
        {title}
      </Typography>
    </article>
  );
};
