import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

interface PostExperienceLayoutProps {
  hero: ReactNode;
  rail?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PostExperienceLayout = ({
  hero,
  rail,
  children,
  className,
}: PostExperienceLayoutProps): ReactElement => {
  return (
    <div
      className={classNames(
        'relative flex w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2',
        className,
      )}
      data-testid="post-experience-layout"
    >
      <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -left-20 -top-20 size-80 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/10 pointer-events-none absolute -right-16 top-16 size-72 rounded-full blur-3xl" />
      <div className="bg-accent-water-default/10 pointer-events-none absolute bottom-0 left-1/3 size-56 rounded-full blur-3xl" />

      <div className="relative z-1">{hero}</div>
      <div className="relative z-1 grid gap-6 border-t border-border-subtlest-tertiary p-4 tablet:p-6 laptop:grid-cols-[minmax(0,1fr)_20rem] laptop:p-8">
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
        {rail && (
          <aside className="flex min-w-0 flex-col gap-3 laptop:sticky laptop:top-20 laptop:self-start">
            {rail}
          </aside>
        )}
      </div>
    </div>
  );
};
