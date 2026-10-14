import type { ReactElement } from 'react';
import React from 'react';
import type { LeaderboardListContainerProps } from './common';
import { LeaderboardCard } from './common';
import Link from '../../utilities/Link';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';

export function LeaderboardListContainer({
  children,
  className,
  title,
  titleHref,
  footer,
  header,
  isLoading,
}: LeaderboardListContainerProps): ReactElement {
  return (
    <LeaderboardCard className={className}>
      {header ?? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-bold typo-body tablet:typo-title3">
            {titleHref ? (
              <Link href={titleHref} passHref prefetch={false}>
                <a className="flex w-fit items-center gap-1 hover:underline">
                  {title}
                  <ArrowIcon
                    className="hidden rotate-90 tablet:block"
                    size={IconSize.XSmall}
                  />
                </a>
              </Link>
            ) : (
              <>{title}</>
            )}
          </h3>
          {titleHref && (
            <Link href={titleHref} passHref prefetch={false}>
              <a className="shrink-0 text-text-tertiary typo-callout hover:underline tablet:hidden">
                See all
              </a>
            </Link>
          )}
        </div>
      )}
      <ol
        className="-mx-2 flex flex-col gap-1.5 typo-body tablet:mx-0"
        aria-busy={isLoading || undefined}
      >
        {children}
      </ol>
      {footer && <div className="mt-auto">{footer}</div>}
    </LeaderboardCard>
  );
}
