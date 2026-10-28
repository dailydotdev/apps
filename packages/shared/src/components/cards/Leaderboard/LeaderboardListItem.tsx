import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { largeNumberFormat } from '../../../lib';
import Link from '../../utilities/Link';
import { Tooltip } from '../../tooltip/Tooltip';

interface LeaderboardListItemProps {
  href?: string;
  index: number;
  children: ReactNode;
  className?: string;
  indexClassName?: string;
  concatScore?: boolean;
  onMouseEnter?: React.MouseEventHandler<HTMLLIElement>;
}

export function LeaderboardListItem({
  index,
  href,
  children,
  className,
  indexClassName = 'w-14',
  concatScore = true,
  onMouseEnter,
}: LeaderboardListItemProps): ReactElement {
  const formattedNumber = concatScore ? largeNumberFormat(index) : index;
  const shouldShowTooltip =
    concatScore && typeof index === 'number' && index >= 1000;
  const actualNumber = index.toLocaleString();
  const content = (
    <>
      <Tooltip content={actualNumber} visible={shouldShowTooltip}>
        <span
          className={classNames(
            'inline-flex shrink-0 tabular-nums text-text-quaternary tablet:justify-center',
            indexClassName,
          )}
        >
          {formattedNumber}
        </span>
      </Tooltip>
      {children}
    </>
  );

  return (
    <li className={className} onMouseEnter={onMouseEnter}>
      {href ? (
        <Link href={href} prefetch={false}>
          <a className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler">
            {content}
          </a>
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
