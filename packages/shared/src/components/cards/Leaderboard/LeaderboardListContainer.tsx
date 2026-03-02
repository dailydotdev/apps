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
}: LeaderboardListContainerProps): ReactElement {
  return (
    <LeaderboardCard className={className}>
      {header ?? (
        <h3 className="mb-2 font-bold typo-title3">
          {titleHref ? (
            <Link href={titleHref} passHref prefetch={false}>
              <a className="flex w-fit items-center gap-1 hover:underline">
                {title}
                {titleHref && (
                  <ArrowIcon className="rotate-90" size={IconSize.XSmall} />
                )}
              </a>
            </Link>
          ) : (
            <>{title}</>
          )}
        </h3>
      )}
      <ol className="flex flex-col gap-1.5 typo-body">{children}</ol>
      {footer && <div className="mt-auto">{footer}</div>}
    </LeaderboardCard>
  );
}
