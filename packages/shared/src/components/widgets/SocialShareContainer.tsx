import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface SocialShareContainerProps {
  title: string;
  children?: ReactNode;
  className?: string;
  /** Tightens the gap under the title and between tiles, for a dropdown. */
  compact?: boolean;
}

export function SocialShareContainer({
  title,
  className,
  compact = false,
  children,
}: SocialShareContainerProps): ReactElement {
  return (
    <section className={classNames('flex flex-col', className)}>
      <h4 className="font-bold typo-callout">{title}</h4>
      <div
        className={classNames(
          'tablet:overflow no-scrollbar flex w-fit max-w-full flex-row overflow-x-scroll tablet:grid tablet:grid-cols-5 tablet:overflow-hidden',
          compact ? 'mt-2 gap-2' : 'mt-4 gap-4',
        )}
      >
        {children}
      </div>
    </section>
  );
}
