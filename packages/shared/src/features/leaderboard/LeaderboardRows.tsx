import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '../../components/icons/Arrow';
import { IconSize } from '../../components/Icon';
import { TopRankBadge } from '../../components/cards/Leaderboard/TopRankBadge';
import Link from '../../components/utilities/Link';

/** Your own row and card: a soft tint, no border. */
export const youHighlightClassName = 'bg-theme-overlay-float-cabbage';

export const LeaderboardHeading = ({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <header className="flex items-center justify-between gap-4">
    <h2 className="font-bold typo-title3">{title}</h2>
    {action}
  </header>
);

const textLinkClassName =
  'flex shrink-0 items-center gap-1 font-bold text-text-tertiary typo-footnote';

/** A link-styled cue; with no `href` it is only a pressable card's label. */
export const LeaderboardTextLink = ({
  children,
  href,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
}): ReactElement => {
  const content = (
    <>
      {children}
      <ArrowIcon size={IconSize.Size16} className="rotate-90" />
    </>
  );

  if (!href) {
    return <span className={textLinkClassName}>{content}</span>;
  }

  return (
    <Link href={href} passHref prefetch={false}>
      <a
        href={href}
        className={classNames(textLinkClassName, 'hover:text-text-primary')}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    </Link>
  );
};

/** A medal for the top 3, the number for everyone else. Never blank. */
export const LeaderboardRank = ({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex w-8 shrink-0 items-center justify-center tabular-nums',
      className,
    )}
  >
    {rank <= 3 ? (
      <>
        <TopRankBadge rankIndex={rank - 1} />
        <span className="sr-only">{rank}</span>
      </>
    ) : (
      <span className="font-bold text-text-tertiary typo-callout">
        {rank.toLocaleString('en-US')}
      </span>
    )}
  </span>
);

export const LeaderboardEmptyBoard = (): ReactElement => (
  <p className="px-2 py-3 text-text-tertiary typo-footnote">
    Nothing here right now. Check back soon.
  </p>
);

/**
 * A full-size row: the top reputation columns and a board's own page. With an
 * `href` the row is a profile link.
 */
export const LeaderboardListRow = ({
  rank,
  name,
  image,
  value,
  highlight = false,
  href,
  onClick,
}: {
  rank: number | string;
  name: string;
  image: ReactNode;
  value: ReactNode;
  highlight?: boolean;
  href?: string;
  onClick?: () => void;
}): ReactElement => {
  const className = classNames(
    'flex h-12 items-center gap-3 rounded-12 px-2',
    highlight ? youHighlightClassName : href && 'hover:bg-surface-hover',
  );
  const content = (
    <>
      {typeof rank === 'number' ? (
        <LeaderboardRank rank={rank} />
      ) : (
        <span className="flex min-w-8 shrink-0 justify-center font-bold tabular-nums text-text-tertiary typo-callout">
          {rank}
        </span>
      )}
      {image}
      <span
        className={classNames(
          'min-w-0 flex-1 truncate font-bold typo-callout',
          highlight && 'text-accent-cabbage-default',
        )}
      >
        {name}
      </span>
      <span className="flex shrink-0 font-bold tabular-nums typo-footnote">
        {value}
      </span>
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} passHref prefetch={false}>
          <a href={href} className={className} onClick={onClick}>
            {content}
          </a>
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
};

/**
 * A row on a board tile: rank, who, and the score. With
 * an `href` the row is the person's profile link.
 */
export const LeaderboardMiniRow = ({
  rank,
  name,
  image,
  value,
  highlight = false,
  href,
  onClick,
}: {
  rank: number | string;
  name: string;
  image: ReactNode;
  value: ReactNode;
  highlight?: boolean;
  href?: string;
  onClick?: () => void;
}): ReactElement => {
  const className = classNames(
    'flex h-9 items-center gap-2 rounded-10 px-1.5',
    highlight ? youHighlightClassName : 'hover:bg-surface-hover',
  );
  const content = (
    <>
      <span className="flex min-w-6 shrink-0 justify-center">
        {typeof rank === 'number' && rank <= 3 ? (
          <LeaderboardRank rank={rank} className="!w-6" />
        ) : (
          <span className="font-bold tabular-nums text-text-tertiary typo-caption1">
            {typeof rank === 'number' ? rank.toLocaleString('en-US') : rank}
          </span>
        )}
      </span>
      {image}
      <span
        className={classNames(
          'min-w-0 flex-1 truncate font-bold typo-footnote',
          highlight && 'text-accent-cabbage-default',
        )}
      >
        {name}
      </span>
      <div className="flex shrink-0 font-bold tabular-nums typo-footnote">
        {value}
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} passHref prefetch={false}>
          <a href={href} className={className} onClick={onClick}>
            {content}
          </a>
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
};
