import React, { ReactElement, ReactNode } from 'react';
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
      <h4 className="font-bold typo-callout">{title}</h4>
      <div className="flex tablet:grid tablet:overflow-hidden overflow-x-scroll flex-row tablet:grid-cols-5 gap-4 mt-4 max-w-full tablet:overflow w-fit">
        {children}
      </div>
    </section>
  );
}
