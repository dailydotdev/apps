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
      <div className={classNames('grid grid-cols-5 gap-4 w-fit mt-4')}>
        {children}
      </div>
    </section>
  );
}
