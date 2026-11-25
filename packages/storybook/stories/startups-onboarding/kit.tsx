import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum Severity {
  Launch = 'Before launch',
  High = 'High',
  Polish = 'Polish',
  Keep = 'Keep',
}

const severityClass: Record<Severity, string> = {
  [Severity.Launch]: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  [Severity.High]: 'bg-accent-bun-flat text-accent-bun-default',
  [Severity.Polish]: 'bg-surface-float text-text-secondary',
  [Severity.Keep]: 'bg-accent-avocado-flat text-accent-avocado-default',
};

export const Badge = ({ severity }: { severity: Severity }): ReactElement => (
  <span
    className={classNames(
      'shrink-0 self-start whitespace-nowrap rounded-8 px-2 py-0.5 font-bold typo-caption1',
      severityClass[severity],
    )}
  >
    {severity}
  </span>
);

export const Card = ({
  title,
  badge,
  children,
  href,
}: {
  title: string;
  badge?: Severity;
  children?: ReactNode;
  href?: string;
}): ReactElement => {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-balance font-bold typo-callout">
          {title}
        </p>
        {badge && <Badge severity={badge} />}
      </div>
      {children && (
        <div className="text-pretty text-text-secondary typo-footnote">
          {children}
        </div>
      )}
    </>
  );
  const className =
    'flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4';

  return href ? (
    <a
      href={href}
      target="_top"
      className={classNames(className, 'hover:bg-surface-float')}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
};

export const Grid = ({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}): ReactElement => (
  <div
    className={classNames(
      'grid grid-cols-1 gap-4',
      columns === 2
        ? 'tablet:grid-cols-2'
        : 'tablet:grid-cols-2 laptop:grid-cols-3',
    )}
  >
    {children}
  </div>
);

export const storyId = (group: string, story: string): string =>
  `startups-onboarding-${group}--${story}`;

export const storyHref = (group: string, story: string): string =>
  `/?path=/story/${storyId(group, story)}`;
