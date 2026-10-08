import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { DiscoverStyles } from './kit';

// Page furniture for the write-up around the layouts. Kept plain on
// purpose so the frames are the loudest thing on the page.

export const DocPage = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <DiscoverStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-12">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="max-w-[30ch] font-bold typo-mega3">{title}</h1>
          {intro && (
            <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
              {intro}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  </ExtensionProviders>
);

export const Eyebrow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

export const DocSection = ({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}): ReactElement => (
  <section className={classNames('flex flex-col gap-5', className)}>
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title2">{title}</h2>
      {lead && (
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

export const Callout = ({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'good' | 'bad' | 'brand';
  title?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1 rounded-16 border p-4 typo-callout',
      tone === 'neutral' && 'border-border-subtlest-tertiary',
      tone === 'good' && 'border-accent-avocado-default bg-accent-avocado-flat',
      tone === 'bad' && 'border-accent-ketchup-default bg-accent-ketchup-flat',
      tone === 'brand' &&
        'border-accent-cabbage-default bg-accent-cabbage-flat',
    )}
  >
    {title && <strong className="text-text-primary">{title}</strong>}
    <div className="text-text-secondary">{children}</div>
  </div>
);

export const Stat = ({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="sd-nums font-bold typo-title1">{value}</span>
    <span className="text-text-secondary typo-callout">{label}</span>
    {note && <span className="text-text-quaternary typo-footnote">{note}</span>}
  </div>
);

export const Bullets = ({ items }: { items: ReactNode[] }): ReactElement => (
  <ul className="flex max-w-[90ch] flex-col gap-2 text-text-secondary typo-callout">
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index} className="flex gap-2">
        <span className="text-text-quaternary">•</span>
        <span className="min-w-0 flex-1 whitespace-normal break-words">
          {item}
        </span>
      </li>
    ))}
  </ul>
);

export const ProsCons = ({
  pros,
  cons,
  measure,
}: {
  pros: string[];
  cons: string[];
  measure?: string;
}): ReactElement => (
  <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
    <Callout tone="good" title="Why it could win">
      <Bullets items={pros} />
    </Callout>
    <Callout tone="bad" title="What it costs">
      <Bullets items={cons} />
    </Callout>
    {measure && (
      <Callout title="What would prove it">
        <p>{measure}</p>
      </Callout>
    )}
  </div>
);
