import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export const Page = ({
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
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-8">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">{eyebrow}</p>
        <h1 className="font-bold typo-title1">{title}</h1>
        {intro && (
          <div className="text-text-secondary typo-callout">{intro}</div>
        )}
      </header>
      {children}
    </div>
  </div>
);

export const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    {children}
  </section>
);

export type Status = 'Restyle' | 'New' | 'Before';

/** A labelled slot: a status tag, a title and where it lives. */
export const Labeled = ({
  status,
  title,
  where,
  children,
}: {
  status: Status;
  title: string;
  where?: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-3">
    <figcaption className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className={classNames(
            'rounded-8 px-2 py-0.5 font-bold text-white typo-caption1',
            status === 'New' && 'bg-accent-cabbage-default',
            status === 'Restyle' && 'bg-accent-water-default',
            status === 'Before' && 'bg-accent-ketchup-default',
          )}
        >
          {status}
        </span>
        <p className="font-bold typo-callout">{title}</p>
      </div>
      {where && <p className="text-text-tertiary typo-footnote">{where}</p>}
    </figcaption>
    {children}
  </figure>
);
