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

interface PlusEntryRowProps {
  href: string;
  title: string;
  description: ReactNode;
  trailing?: ReactNode;
  member?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export const PlusEntryRow = ({
  href,
  title,
  description,
  trailing,
  member = false,
  onClick,
  className,
}: PlusEntryRowProps): ReactElement => (
  <Link href={href} passHref>
    <a
      href={href}
      onClick={onClick}
      className={classNames(
        'focus-outline flex min-h-14 items-center gap-3 rounded-12 px-2 py-2 hover:bg-surface-hover',
        className,
      )}
    >
      <PlusTile muted={member} />
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
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
          className="rotate-90 text-text-quaternary"
        />
      )}
    </a>
  </Link>
);
