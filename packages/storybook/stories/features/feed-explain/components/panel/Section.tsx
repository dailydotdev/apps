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
      <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-1">
        <h2
          id={`${sectionId(section)}-title`}
          className="font-bold text-text-primary typo-title3"
        >
          {title}
        </h2>
        {description && (
          <p className="text-text-tertiary typo-callout">{description}</p>
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

/** A titled card of rows, like the topics you follow. */
export const PanelList = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <header className="flex flex-col gap-0.5">
      <h3 className="font-bold text-text-primary typo-body">{title}</h3>
      {description && (
        <p className="text-text-tertiary typo-footnote">{description}</p>
      )}
    </header>
    <PanelCard>
      <ul className="flex flex-col divide-y divide-border-subtlest-tertiary @container">
        {children}
      </ul>
    </PanelCard>
  </div>
);

export const PanelListEmpty = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <li className="p-4 text-text-tertiary typo-footnote">{children}</li>
);

/**
 * One topic, source or person: who it is, its boost and one action. The boost
 * sits between them on a wide list and under them on a narrow one.
 */
export const EntityRow = ({
  media,
  name,
  description,
  isStruck,
  boost,
  action,
}: {
  media: ReactNode;
  name: string;
  description?: string;
  isStruck?: boolean;
  boost?: ReactNode;
  action: ReactNode;
}): ReactElement => (
  <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 p-3 @2xl:grid-cols-[minmax(0,1fr)_16rem_auto]">
    <span className="flex min-w-0 items-center gap-3">
      {media}
      <span className="flex min-w-0 shrink flex-col gap-0.5">
        <span
          className={classNames(
            'truncate font-bold typo-callout',
            isStruck ? 'text-text-tertiary line-through' : 'text-text-primary',
          )}
        >
          {name}
        </span>
        {description && (
          <span className="text-text-tertiary typo-footnote">
            {description}
          </span>
        )}
      </span>
    </span>
    {boost && (
      <span className="col-span-2 row-start-2 flex min-w-0 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
        {boost}
      </span>
    )}
    <span className="col-start-2 row-start-1 flex @2xl:col-start-3">
      {action}
    </span>
  </li>
);
