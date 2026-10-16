import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ControlSection } from '../FeedScreenContext';

export const sectionId = (section: ControlSection): string =>
  `personalization-${section}`;

export const PanelSection = ({
  section,
  title,
  description,
  actions,
  children,
  className,
}: {
  section: ControlSection;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    id={sectionId(section)}
    aria-labelledby={`${sectionId(section)}-title`}
    className={classNames('flex scroll-mt-24 flex-col gap-4', className)}
  >
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 shrink flex-col gap-1">
        <h2
          id={`${sectionId(section)}-title`}
          className="font-bold text-text-primary typo-title3"
        >
          {title}
        </h2>
        {description && (
          <p className="max-w-[40rem] text-text-tertiary typo-callout">
            {description}
          </p>
        )}
      </div>
      {actions}
    </header>
    {children}
  </section>
);

export const PanelCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'rounded-16 border border-border-subtlest-tertiary bg-background-subtle',
      className,
    )}
  >
    {children}
  </div>
);

export const Badge = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex h-5 shrink-0 items-center rounded-6 px-1.5 font-bold typo-caption2',
      className ?? 'bg-surface-float text-text-tertiary',
    )}
  >
    {children}
  </span>
);
