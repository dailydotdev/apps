import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { LAPTOP, PHONE, Shot } from './shot';
import type { Variation } from './variations';
import type { Variation2 } from './variations2';

export const Page = ({
  chapter,
  question,
  title,
  goal,
  metric,
  children,
}: {
  chapter: string;
  question: string;
  title: string;
  goal: string;
  metric: string;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default p-4 tablet:p-6 laptop:p-10">
    <header className="mb-10 flex max-w-[48rem] flex-col gap-3">
      <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
        {chapter} · {question}
      </span>
      <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 typo-callout">
        <dt className="text-text-tertiary">Goal</dt>
        <dd className="text-text-secondary">{goal}</dd>
        <dt className="text-text-tertiary">Metric</dt>
        <dd className="text-text-secondary">{metric}</dd>
      </dl>
    </header>
    <div className="flex flex-col gap-14">{children}</div>
  </div>
);

export const Case = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex max-w-[56rem] flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
      {!!note && <div className="text-text-tertiary typo-callout">{note}</div>}
    </div>
    {children}
  </section>
);

export const Prose = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex max-w-[56rem] flex-col gap-3 text-text-secondary typo-body [&_strong]:text-text-primary">
    {children}
  </div>
);

export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <table className="max-w-[64rem] border-collapse text-left typo-callout">
    <thead>
      <tr>
        {head.map((cell) => (
          <th
            key={cell}
            className="border-b border-border-subtlest-tertiary py-2 pr-6 font-bold text-text-tertiary typo-caption1"
          >
            {cell}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={String(row[0])} className="align-top">
          {row.map((cell, i) => (
            <td
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="border-b border-border-subtlest-tertiary py-2 pr-6 text-text-secondary first:font-bold first:text-text-primary"
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/** One variation: its bet, what moved, what to watch, then the laptop and
 * phone renders. */
export const VariationPage = ({
  variation,
  chapter,
  goal,
  metric,
}: {
  variation: Variation;
  chapter: string;
  goal: string;
  metric: string;
}): ReactElement => (
  <Page
    chapter={chapter}
    question={variation.hypothesis.split(',')[0].replace(/^If /, 'What if ')}
    title={`${variation.id} · ${variation.title}`}
    goal={goal}
    metric={metric}
  >
    <dl className="grid max-w-[56rem] grid-cols-[auto_1fr] gap-x-4 gap-y-2 typo-callout">
      <dt className="text-text-tertiary">Bet</dt>
      <dd className="text-text-secondary">{variation.hypothesis}</dd>
      <dt className="text-text-tertiary">Change</dt>
      <dd className="text-text-secondary">{variation.change}</dd>
      <dt className="text-text-tertiary">Watch</dt>
      <dd className="text-text-secondary">{variation.risk}</dd>
    </dl>
    <Shot width={LAPTOP} label="Laptop · 1440">
      {variation.render()}
    </Shot>
    <div className="flex flex-wrap items-start gap-10">
      <div className="w-[390px] shrink-0">
        <Shot width={PHONE} label="Phone · 390" note={variation.phoneNote}>
          {variation.render()}
        </Shot>
      </div>
    </div>
  </Page>
);

export const Gallery = ({
  variations,
}: {
  variations: Variation[];
}): ReactElement => (
  <>
    {variations.map((variation) => (
      <Case
        key={variation.id}
        title={`${variation.id} · ${variation.title}`}
        note={variation.hypothesis}
      >
        <Shot width={LAPTOP}>{variation.render()}</Shot>
      </Case>
    ))}
  </>
);

export const VariationPage2 = ({
  variation,
  chapter,
  goal,
  metric,
}: {
  variation: Variation2;
  chapter: string;
  goal: string;
  metric: string;
}): ReactElement => (
  <Page
    chapter={chapter}
    question={variation.hypothesis.split(',')[0].replace(/^If /, 'What if ')}
    title={`${variation.id} · ${variation.title}${
      variation.final ? ' · FINAL' : ''
    }`}
    goal={goal}
    metric={metric}
  >
    {variation.decision && (
      <div className="max-w-[56rem] rounded-16 border border-accent-cabbage-default bg-accent-cabbage-subtlest p-4 text-text-primary typo-callout">
        <strong>Decision.</strong> {variation.decision}
      </div>
    )}
    <dl className="grid max-w-[56rem] grid-cols-[auto_1fr] gap-x-4 gap-y-2 typo-callout">
      <dt className="text-text-tertiary">Borrowed from</dt>
      <dd className="text-text-secondary">{variation.borrowed}</dd>
      <dt className="text-text-tertiary">Bet</dt>
      <dd className="text-text-secondary">{variation.hypothesis}</dd>
      <dt className="text-text-tertiary">Change</dt>
      <dd className="text-text-secondary">{variation.change}</dd>
      <dt className="text-text-tertiary">Watch</dt>
      <dd className="text-text-secondary">{variation.risk}</dd>
    </dl>
    <Shot
      width={LAPTOP}
      height={variation.scroll ? 900 : undefined}
      label="Laptop · 1440"
      note={variation.scroll ? 'Scroll inside the frame' : undefined}
    >
      {variation.render()}
    </Shot>
    {variation.renderSecond && (
      <Shot width={LAPTOP} label={variation.secondLabel ?? 'Screen 2'}>
        {variation.renderSecond()}
      </Shot>
    )}
    <div className="flex flex-wrap items-start gap-10">
      <div className="w-[390px] shrink-0">
        <Shot
          width={PHONE}
          height={variation.scroll ? 800 : undefined}
          label="Phone · 390"
          note={variation.phoneNote}
        >
          {variation.render()}
        </Shot>
      </div>
    </div>
  </Page>
);

export const Gallery2 = ({
  variations,
}: {
  variations: Variation2[];
}): ReactElement => (
  <>
    {variations.map((variation) => (
      <Case
        key={variation.id}
        title={`${variation.id} · ${variation.title}${
          variation.final ? ' · FINAL' : ''
        }`}
        note={
          <>
            <p className="m-0">{variation.hypothesis}</p>
            <p className="m-0 mt-1 text-text-quaternary">
              Borrowed from: {variation.borrowed}
            </p>
          </>
        }
      >
        <Shot width={LAPTOP} height={variation.scroll ? 900 : undefined}>
          {variation.render()}
        </Shot>
      </Case>
    ))}
  </>
);
