import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface EntitySectionHeadingProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const EntitySectionHeading = ({
  children,
  icon,
  className,
}: EntitySectionHeadingProps): ReactElement => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Title3}
    color={TypographyColor.Primary}
    bold
    className={classNames('mb-4 mt-2', className)}
  >
    {icon ? (
      <span className="inline-flex flex-wrap items-center gap-x-1.5">
        {icon}
        <span>{children}</span>
      </span>
    ) : (
      children
    )}
  </Typography>
);
