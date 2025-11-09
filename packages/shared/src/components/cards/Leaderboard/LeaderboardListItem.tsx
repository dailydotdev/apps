import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { largeNumberFormat } from '../../../lib';
import ConditionalWrapper from '../../ConditionalWrapper';
import Link from '../../utilities/Link';

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
            <a className="rounded-8 hover:bg-accent-pepper-subtler flex w-full flex-row items-center px-2">
              {child}
            </a>
          </Link>
        )}
      >
        <span className="text-text-quaternary inline-flex min-w-14 justify-center">
          {largeNumberFormat(index)}
        </span>
        {children}
      </ConditionalWrapper>
    </li>
  );
}
