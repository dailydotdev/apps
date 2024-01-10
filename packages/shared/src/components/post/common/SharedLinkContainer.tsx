import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import classNames from 'classnames';
import PostSummary from '../../cards/PostSummary';
import ArrowIcon from '../../icons/Arrow';

interface SharedLinkContainerProps {
  children: ReactNode;
  summary?: string;
  className?: string;
}

export function SharedLinkContainer({
  children,
  summary,
  className,
}: SharedLinkContainerProps): ReactElement {
  const [height, setHeight] = useState<number>(null);
  const [shouldShowSummary, setShouldShowSummary] = useState(true);
  const tldrHeight = useMemo(() => {
    if (height === null) {
      return 'auto';
    }

    return shouldShowSummary ? height : 0;
  }, [shouldShowSummary, height]);

  return (
    <div
      className={classNames(
        'flex flex-col rounded-16 border border-theme-divider-tertiary hover:border-theme-divider-secondary',
        className,
      )}
    >
      {children}
      {summary && (
        <>
          <PostSummary
            ref={(el) => {
              if (!el?.offsetHeight || height !== null) {
                return;
              }

              setHeight(el.offsetHeight);
            }}
            style={{ height: tldrHeight }}
            className={classNames(
              'mx-4 transition-all duration-300 ease-in-out',
              shouldShowSummary && 'mb-4',
            )}
            summary={summary}
          />
          <button
            type="button"
            className="flex w-full flex-row justify-center border-t border-theme-divider-tertiary py-2 font-bold typo-callout hover:underline"
            onClick={() => setShouldShowSummary(!shouldShowSummary)}
          >
            {shouldShowSummary ? 'Hide' : 'Show'} TLDR{' '}
            <ArrowIcon
              className={classNames(
                'ml-2 transition-transform duration-300 ease-in-out',
                !shouldShowSummary && 'rotate-180',
              )}
            />
          </button>
        </>
      )}
    </div>
  );
}
