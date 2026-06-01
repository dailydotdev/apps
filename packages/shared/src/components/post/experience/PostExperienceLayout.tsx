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

      <div className="relative z-1">{hero}</div>
      <div className="relative z-1 border-t border-border-subtlest-tertiary px-4 py-6 tablet:px-6 laptop:px-8">
        <main className="mx-auto flex w-full min-w-0 max-w-[48rem] flex-col gap-8">
          {children}
        </main>
      </div>
      {rail && (
        <aside className="bg-surface-float/50 relative z-1 border-t border-border-subtlest-tertiary px-4 py-6 tablet:px-6 laptop:px-8">
          <div className="mx-auto grid w-full max-w-[64rem] gap-3 laptop:grid-cols-3">
            {rail}
          </div>
        </aside>
      )}
    </div>
  );
};
