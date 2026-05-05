import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

interface LiveRoomStagePagerProps {
  pageCount: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const LiveRoomStagePager = ({
  pageCount,
  currentPage,
  onPageSelect,
  onPrev,
  onNext,
}: LiveRoomStagePagerProps): ReactElement | null => {
  if (pageCount <= 1) {
    return null;
  }

  const isAtFirst = currentPage === 0;
  const isAtLast = currentPage >= pageCount - 1;

  return (
    <div
      role="tablist"
      aria-label="Stage pages"
      className="pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-2 flex justify-center tablet:bottom-[5.5rem]"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1 shadow-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={isAtFirst}
          onClick={onPrev}
          className="flex size-6 shrink-0 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent"
        >
          <ArrowIcon className="-rotate-90" size={IconSize.XSmall} />
        </button>
        <div className="flex items-center gap-1.5 px-1">
          {Array.from({ length: pageCount }, (_, index) => {
            const isActive = index === currentPage;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to stage page ${index + 1} of ${pageCount}`}
                onClick={() => onPageSelect(index)}
                className={classNames(
                  'flex shrink-0 items-center justify-center transition-all duration-200 ease-out',
                  isActive
                    ? 'h-5 rounded-6 bg-text-primary px-1.5 text-surface-invert'
                    : 'size-1.5 rounded-full bg-text-quaternary hover:bg-text-tertiary',
                )}
              >
                {isActive ? (
                  <span className="font-bold tabular-nums leading-none typo-caption2">
                    {index + 1}/{pageCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Next page"
          disabled={isAtLast}
          onClick={onNext}
          className="flex size-6 shrink-0 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent"
        >
          <ArrowIcon className="rotate-90" size={IconSize.XSmall} />
        </button>
      </div>
    </div>
  );
};
