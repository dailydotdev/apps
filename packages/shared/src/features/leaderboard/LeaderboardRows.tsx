import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '../../components/icons/Arrow';
import { IconSize } from '../../components/Icon';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
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
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
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

export const LeaderboardRowPlaceholder = (): ReactElement => (
  <li className="flex h-12 items-center gap-3 px-2">
    <ElementPlaceholder className="h-3 w-6 rounded-4" />
    <ElementPlaceholder className="size-8 rounded-10" />
    <ElementPlaceholder className="h-3 w-2/5 rounded-4" />
  </li>
);

export const LeaderboardEmptyBoard = (): ReactElement => (
  <p className="px-2 py-3 text-text-tertiary typo-footnote">
    Nothing here right now. Check back soon.
  </p>
);

/** A row on a board tile and in its full list: rank, who, and the score. */
export const LeaderboardMiniRow = ({
  rank,
  name,
  image,
  value,
  highlight = false,
}: {
  rank: number | string;
  name: string;
  image: ReactNode;
  value: ReactNode;
  highlight?: boolean;
}): ReactElement => (
  <li
    className={classNames(
      'flex h-9 items-center gap-2 rounded-10 px-1.5',
      highlight ? youHighlightClassName : 'hover:bg-surface-hover',
    )}
  >
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
  </li>
);
