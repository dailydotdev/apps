import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons/Arrow';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { PlusTile } from './PlusPreview';

// Mirrors ProfileMenuHeader so the row reads as a sibling of the avatar block:
// the tile matches the avatar size, the title and line match name and handle.
export enum PlusEntryRowSize {
  Medium = 'medium',
  Large = 'large',
}

const tileClassName: Record<PlusEntryRowSize, string> = {
  [PlusEntryRowSize.Medium]: 'size-8 rounded-10',
  [PlusEntryRowSize.Large]: 'size-10 rounded-10',
};

const tileIconSize: Record<PlusEntryRowSize, IconSize> = {
  [PlusEntryRowSize.Medium]: IconSize.Size16,
  [PlusEntryRowSize.Large]: IconSize.XSmall,
};

interface PlusEntryRowProps {
  href: string;
  title: string;
  description: ReactNode;
  trailing?: ReactNode;
  member?: boolean;
  size?: PlusEntryRowSize;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export const PlusEntryRow = ({
  href,
  title,
  description,
  trailing,
  member = false,
  size = PlusEntryRowSize.Medium,
  onClick,
  className = 'rounded-10 px-1 hover:bg-surface-float',
}: PlusEntryRowProps): ReactElement => (
  <Link href={href} passHref>
    <a
      href={href}
      onClick={onClick}
      className={classNames('focus-outline flex items-center gap-2', className)}
    >
      <PlusTile
        muted={member}
        className={tileClassName[size]}
        iconSize={tileIconSize[size]}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Primary}
          bold
          truncate
        >
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          {description}
        </Typography>
      </span>
      {trailing ?? (
        <ArrowIcon
          aria-hidden
          size={IconSize.Size16}
          className="rotate-90 text-text-quaternary tablet:hidden"
        />
      )}
    </a>
  </Link>
);
