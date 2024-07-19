import React, { ReactElement, ReactNode, useState } from 'react';
import classNames from 'classnames';
import PostSummary from '../../cards/PostSummary';
import { ArrowIcon } from '../../icons';

interface SharedLinkContainerProps {
  children: ReactNode;
  summary?: string;
  className?: string;
  Wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export function SharedLinkContainer({
  children,
  summary,
  className,
  Wrapper,
}: SharedLinkContainerProps): ReactElement {
  const [shouldShowSummary, setShouldShowSummary] = useState(true);

  const postSummary = (
    <PostSummary
      className={classNames(
        'mx-4 !grid transition-all duration-300 ease-in-out',
        shouldShowSummary ? 'mb-4 grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
      summary={summary}
    />
  );

  return (
    <div
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        className,
      )}
    >
      {children}
      {summary && (
        <>
          {Wrapper ? <Wrapper>{postSummary}</Wrapper> : postSummary}
          <button
            type="button"
            className="flex w-full flex-row justify-center border-t border-border-subtlest-tertiary py-2 font-bold typo-callout hover:underline"
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
