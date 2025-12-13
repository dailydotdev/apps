import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { largeNumberFormat } from '../../../lib';
import ConditionalWrapper from '../../ConditionalWrapper';
import Link from '../../utilities/Link';
import { Tooltip } from '../../tooltip/Tooltip';

interface LeaderboardListItemProps {
  href?: string;
  index: number;
  children: ReactNode;
  className?: string;
  concatScore?: boolean;
}

export function LeaderboardListItem({
  index,
  href,
  children,
  className,
  concatScore = true,
}: LeaderboardListItemProps): ReactElement {
  const formattedNumber = concatScore ? largeNumberFormat(index) : index;
  const shouldShowTooltip =
    concatScore && typeof index === 'number' && index >= 1000;
  const actualNumber = index.toLocaleString();

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
        <Tooltip content={actualNumber} visible={shouldShowTooltip}>
          <span className="inline-flex min-w-14 justify-center text-text-quaternary">
            {formattedNumber}
          </span>
        </Tooltip>
        {children}
      </ConditionalWrapper>
    </li>
  );
}
