import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { IconSize } from '../../../components/Icon';

export interface BriefPostHeaderProps extends PropsWithChildren {
  kicker: string;
  heading: string;
  stats: {
    Icon: React.ComponentType<{ size: IconSize }>;
    label: string;
  }[];
}

export const BriefPostHeader = ({
  kicker,
  heading,
  stats,
  children,
}: BriefPostHeaderProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex min-w-full items-center justify-between gap-2">
        <Typography
          color={TypographyColor.Secondary}
          type={TypographyType.Callout}
        >
          {kicker}
        </Typography>
        {children && <div>{children}</div>}
      </div>
      <Typography type={TypographyType.LargeTitle} bold>
        {heading}
      </Typography>
      <Typography
        color={TypographyColor.Secondary}
        type={TypographyType.Footnote}
        className="flex gap-1"
      >
        {stats.map(({ Icon, label }) => (
          <span
            className="flex items-center gap-1 whitespace-nowrap"
            key={label}
          >
            <Icon size={IconSize.Size16} aria-hidden /> {label}
          </span>
        ))}
      </Typography>
    </div>
  );
};
