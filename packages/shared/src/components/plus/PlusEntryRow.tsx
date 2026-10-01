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
        'focus-outline flex items-center gap-2 rounded-10 px-1 py-1.5 hover:bg-surface-float',
        className,
      )}
    >
      <PlusTile muted={member} className="size-6 rounded-8 tablet:-mx-0.5" />
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
          className="rotate-90 text-text-quaternary tablet:hidden"
        />
      )}
    </a>
  </Link>
);
