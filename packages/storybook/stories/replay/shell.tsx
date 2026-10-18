import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Category, Status, statusLabel, Tier } from './catalog';

// Documentation chrome for the Replay stories. Provider-free so every story
// renders standalone, and built on theme tokens so the Storybook light/dark
// toggle keeps working — unlike the share frames, which hold a fixed look.

export const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-6 pb-24 pt-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-12">
      {children}
    </div>
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
    <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
      {eyebrow}
    </span>
    <h1 className="max-w-[24ch] typo-mega3">{title}</h1>
    {children && (
      <div className="flex max-w-[70ch] flex-col gap-3 text-text-tertiary typo-body">
        {children}
      </div>
    )}
  </header>
);

export const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <h2 className="typo-title2">{title}</h2>
      {description && (
        <div className="flex max-w-[70ch] flex-col gap-2 text-text-tertiary typo-callout">
          {description}
        </div>
      )}
    </div>
    {children}
  </section>
);

export const Cell = ({
  label,
  note,
  children,
  className,
}: {
  label: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-3', className)}>
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-caption1">{label}</span>
      {note && (
        <span className="text-text-quaternary typo-caption2">{note}</span>
      )}
    </div>
    {children}
  </div>
);

export enum CalloutTone {
  Neutral = 'neutral',
  Good = 'good',
  Bad = 'bad',
}

const toneToBorder: Record<CalloutTone, string> = {
  [CalloutTone.Neutral]: 'border-border-subtlest-tertiary',
  [CalloutTone.Good]: 'border-accent-avocado-default',
  [CalloutTone.Bad]: 'border-accent-ketchup-default',
};

const toneToLabel: Record<CalloutTone, string> = {
  [CalloutTone.Neutral]: '',
  [CalloutTone.Good]: 'Do',
  [CalloutTone.Bad]: "Don't",
};

export const Callout = ({
  tone = CalloutTone.Neutral,
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-16 border-l-2 bg-surface-float px-5 py-4',
      toneToBorder[tone],
    )}
  >
    <div className="flex items-center gap-2">
      {toneToLabel[tone] && (
        <span
          className={classNames(
            'rounded-6 px-1.5 py-0.5 uppercase tracking-wide typo-caption2',
            tone === CalloutTone.Good
              ? 'bg-overlay-float-avocado text-accent-avocado-default'
              : 'bg-overlay-float-ketchup text-accent-ketchup-default',
          )}
        >
          {toneToLabel[tone]}
        </span>
      )}
      <span className="font-bold typo-callout">{title}</span>
    </div>
    {children && (
      <div className="flex flex-col gap-2 text-text-tertiary typo-footnote">
        {children}
      </div>
    )}
  </div>
);

export const Table = ({
  head,
  rows,
  minWidth = 64,
}: {
  head: string[];
  rows: ReactNode[][];
  /** In rem. Wide tables scroll inside their own container. */
  minWidth?: number;
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table
      className="w-full border-collapse text-left"
      style={{ minWidth: `${minWidth}rem` }}
    >
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="whitespace-nowrap px-4 py-3 font-bold text-text-secondary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className="px-4 py-3 text-text-tertiary typo-footnote"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const statusClass: Record<Status, string> = {
  [Status.Now]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [Status.LocalCache]: 'bg-overlay-float-blueCheese text-accent-blueCheese-default',
  [Status.NeedsApi]: 'bg-overlay-float-ketchup text-accent-ketchup-default',
};

export const StatusChip = ({ status }: { status: Status }): ReactElement => (
  <span
    className={classNames(
      'inline-block whitespace-nowrap rounded-6 px-1.5 py-0.5 uppercase tracking-wide typo-caption2',
      statusClass[status],
    )}
  >
    {statusLabel[status]}
  </span>
);

const categoryClass: Record<Category, string> = {
  [Category.Stat]: 'bg-overlay-float-water text-accent-water-default',
  [Category.Surprise]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [Category.Community]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [Category.Crown]: 'bg-overlay-float-cheese text-accent-cheese-default',
};

export const CategoryChip = ({
  category,
}: {
  category: Category;
}): ReactElement => (
  <span
    className={classNames(
      'inline-block whitespace-nowrap rounded-6 px-1.5 py-0.5 uppercase tracking-wide typo-caption2',
      categoryClass[category],
    )}
  >
    {category}
  </span>
);

export const TierChip = ({ tier }: { tier: Tier }): ReactElement => (
  <span className="inline-block whitespace-nowrap rounded-6 bg-surface-float px-1.5 py-0.5 uppercase tracking-wide text-text-tertiary typo-caption2">
    {tier}
  </span>
);

export const Mono = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-mono text-text-secondary typo-caption1">{children}</span>
);

/** A phone bezel, so the story viewer is judged at the size it ships at. */
export const PhoneFrame = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="w-[22rem] max-w-full rounded-[2.25rem] border-2 border-border-subtlest-tertiary bg-background-default p-2 shadow-3">
    {children}
  </div>
);
