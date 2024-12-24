import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

interface FirefoxPermissionItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

export function FirefoxPermissionItem({
  title,
  description,
  icon,
  className,
}: FirefoxPermissionItemProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-row gap-3 border-b border-border-subtlest-tertiary px-4 py-2',
        className,
      )}
    >
      <Typography type={TypographyType.LargeTitle}>{icon}</Typography>
      <div className="flex flex-1 flex-col gap-2 break-words">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {title}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
    </div>
  );
}
