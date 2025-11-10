import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface SocialShareContainerProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function SocialShareContainer({
  title,
  className,
  children,
}: SocialShareContainerProps): ReactElement {
  return (
    <section className={classNames('flex flex-col', className)}>
      <h4 className="typo-callout font-bold">{title}</h4>
      <div className="tablet:overflow no-scrollbar tablet:grid tablet:grid-cols-5 tablet:overflow-hidden mt-4 flex w-fit max-w-full flex-row gap-4 overflow-x-scroll">
        {children}
      </div>
    </section>
  );
}
