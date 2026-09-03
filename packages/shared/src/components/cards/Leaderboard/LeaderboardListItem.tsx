import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import { largeNumberFormat } from '../../../lib';
import Link from '../../utilities/Link';
import { Tooltip } from '../../tooltip/Tooltip';
import { SnapshotButton } from '../../imageShare/SnapshotButton';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';

interface LeaderboardListItemProps {
  href?: string;
  index: number;
  children: ReactNode;
  className?: string;
  concatScore?: boolean;
  onMouseEnter?: React.MouseEventHandler<HTMLLIElement>;
  snapshotFilename?: string;
  snapshotLink?: string;
  snapshotCard?: ReactNode;
}

export function LeaderboardListItem({
  index,
  href,
  children,
  className,
  concatScore = true,
  onMouseEnter,
  snapshotFilename,
  snapshotLink,
  snapshotCard,
}: LeaderboardListItemProps): ReactElement {
  const rowRef = useRef<HTMLLIElement>(null);
  const formattedNumber = concatScore ? largeNumberFormat(index) : index;
  const shouldShowTooltip =
    concatScore && typeof index === 'number' && index >= 1000;
  const actualNumber = index.toLocaleString();
  const content = (
    <>
      <Tooltip content={actualNumber} visible={shouldShowTooltip}>
        <span className="inline-flex w-14 shrink-0 justify-center tabular-nums text-text-quaternary">
          {formattedNumber}
        </span>
      </Tooltip>
      {children}
      {snapshotFilename && (
        <SnapshotButton
          card={snapshotCard}
          className="ml-auto opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          filename={snapshotFilename}
          link={snapshotLink}
          showLabel={false}
          size={ButtonSize.XSmall}
          target={snapshotCard ? undefined : rowRef}
          variant={ButtonVariant.Float}
        />
      )}
    </>
  );

  return (
    <li className={className} onMouseEnter={onMouseEnter} ref={rowRef}>
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
