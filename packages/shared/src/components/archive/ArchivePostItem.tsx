import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { SignalList } from '../cards/common/list/SignalList';

interface ArchivePostItemProps {
  rank: number;
  post: Post;
  className?: string;
}

const getRankStyle = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-accent-cheese-default to-accent-burger-default text-white shadow-[0_0_12px_rgba(255,199,0,0.3)]';
    case 2:
      return 'bg-gradient-to-br from-accent-salt-subtle to-accent-salt-default text-white shadow-[0_0_8px_rgba(192,192,192,0.3)]';
    case 3:
      return 'bg-gradient-to-br from-accent-burger-subtle to-accent-burger-default text-white shadow-[0_0_8px_rgba(205,127,50,0.3)]';
    default:
      return 'bg-surface-float text-text-tertiary';
  }
};

export function ArchivePostItem({
  rank,
  post,
  className,
}: ArchivePostItemProps): ReactElement {
  return (
    <li className={classNames('relative flex items-start', className)}>
      <span
        className={classNames(
          'absolute left-4 top-5 z-1 flex size-6 shrink-0 items-center justify-center rounded-8 font-bold tabular-nums typo-footnote',
          getRankStyle(rank),
        )}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1 pl-8">
        <SignalList post={post} />
      </div>
    </li>
  );
}
