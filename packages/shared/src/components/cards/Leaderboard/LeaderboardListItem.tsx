import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { largeNumberFormat } from '../../../lib';
import ConditionalWrapper from '../../ConditionalWrapper';

interface LeaderboardListItemProps {
  href?: string;
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
      <ConditionalWrapper
        condition={!!href}
        wrapper={(child) => (
          <Link href={href} passHref key={href} prefetch={false}>
            <a className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler">
              {child}
            </a>
          </Link>
        )}
      >
        <span className="inline-flex min-w-4 text-text-quaternary">
          {largeNumberFormat(index)}
        </span>
        {children}
      </ConditionalWrapper>
    </li>
  );
}
