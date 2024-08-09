import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { largeNumberFormat } from '../../../lib';

interface LeaderboardListItemProps {
  href: string;
  index: number;
  children: ReactNode;
  className?: string;
}

export function LeaderboardListItem({
  index,
  href,
  children,
  className,
}: LeaderboardListItemProps): ReactElement {
  return (
    <li className={className}>
      <Link href={href} passHref key={href} prefetch={false}>
        <a className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler">
          <span className="inline-flex min-w-4 text-text-quaternary">
            {largeNumberFormat(index)}
          </span>
          {children}
        </a>
      </Link>
    </li>
  );
}
