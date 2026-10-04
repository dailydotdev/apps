import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Step, prs, statusOf, stepNames } from './plan';
import type { PrStatus } from './plan';

// Chapter 10: the PR walker. Click a PR to read what it ships, what it
// touches, what must already be on main, and what proves it; the strip
// above shows where it sits in the sequence.

const stepTone: Record<Step, string> = {
  [Step.Fixes]: 'bg-surface-float text-text-secondary',
  [Step.Shell]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [Step.Places]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [Step.PostAndYou]: 'bg-overlay-float-bun text-accent-bun-default',
  [Step.Reading]: 'bg-overlay-float-blueCheese text-accent-blueCheese-default',
};

export const StepPill = ({ step }: { step: Step }): ReactElement => (
  <span
    className={classNames(
      'whitespace-nowrap rounded-8 px-2 py-0.5 font-bold typo-caption1',
      stepTone[step],
    )}
  >
    {step} · {stepNames[step]}
  </span>
);

const sizeLabel: Record<'S' | 'M' | 'L', string> = {
  S: 'small: one sitting to review',
  M: 'medium: an hour to review',
  L: 'large: a morning to review, in two passes',
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="text-text-quaternary typo-caption1">{label}</span>
    <span className="text-text-primary typo-callout">{children}</span>
  </div>
);

const statusLabel: Record<PrStatus, string> = {
  shipped: 'Shipped',
  partial: 'Partly shipped',
  open: 'Open',
};

export const StatusChip = ({ status }: { status: PrStatus }): ReactElement => (
  <span
    className={classNames(
      'rounded-6 border px-1.5 py-0.5 font-bold typo-caption2',
      status === 'shipped' && 'border-status-success text-status-success',
      status === 'partial' && 'border-status-warning text-status-warning',
      status === 'open' &&
        'border-border-subtlest-tertiary text-text-quaternary',
    )}
  >
    {statusLabel[status]}
  </span>
);

export const PrWalker = (): ReactElement => {
  const [index, setIndex] = useState(0);
  const current = prs[index];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-text-tertiary typo-footnote">
          PR {index + 1} of {prs.length}. Filled is the one you read; green ones
          shipped, amber ones shipped in part, gray ones wait.
        </span>
        <div className="flex flex-wrap gap-1.5">
          {prs.map((pr, i) => (
            <button
              key={pr.id}
              type="button"
              onClick={() => setIndex(i)}
              title={pr.name}
              className={classNames(
                'flex h-8 items-center rounded-8 border px-2 font-bold tabular-nums typo-footnote',
                i === index
                  ? 'border-text-primary bg-text-primary text-surface-invert'
                  : statusOf(pr.id).status === 'shipped'
                  ? 'border-status-success text-status-success'
                  : statusOf(pr.id).status === 'partial'
                  ? 'border-status-warning text-status-warning'
                  : 'border-border-subtlest-tertiary text-text-quaternary',
              )}
            >
              {pr.id}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold tabular-nums typo-title3">
            {current.id}
          </span>
          <span className="font-bold typo-title3">{current.name}</span>
          <StepPill step={current.step} />
          <span className="text-text-tertiary typo-footnote">
            {sizeLabel[current.size]}
          </span>
          <StatusChip status={statusOf(current.id).status} />
        </div>
        {statusOf(current.id).landed && (
          <Field label="Landed">{statusOf(current.id).landed}</Field>
        )}
        {statusOf(current.id).left && (
          <Field label="Still open">{statusOf(current.id).left}</Field>
        )}
        <Field label="Ships">{current.ships}</Field>
        <Field label="After every merge, the app is whole because">
          {current.whole}
        </Field>
        <Field label="Touches">{current.touches}</Field>
        <Field label="Needs on main first">{current.after}</Field>
        <Field label="Proof attached to the PR">{current.proof}</Field>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-secondary typo-footnote disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={index === prs.length - 1}
            onClick={() => setIndex((i) => Math.min(prs.length - 1, i + 1))}
            className="rounded-10 border border-text-primary bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote disabled:opacity-40"
          >
            Next PR
          </button>
        </div>
      </div>
    </div>
  );
};

// The dependency lines, drawn as a list: which merged PRs each one reads.
export const Sequence = (): ReactElement => (
  <ol className="flex flex-col gap-1.5">
    {prs.map((pr) => (
      <li
        key={pr.id}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-subtlest-tertiary py-2 last:border-0"
      >
        <span className="w-8 font-bold tabular-nums text-text-primary typo-callout">
          {pr.id}
        </span>
        <span className="min-w-0 flex-1 text-text-primary typo-callout">
          {pr.name}
        </span>
        <StepPill step={pr.step} />
        <StatusChip status={statusOf(pr.id).status} />
        <span className="text-text-quaternary tabular-nums typo-footnote">
          after {pr.after}
        </span>
        <span className="w-4 text-center font-bold text-text-tertiary typo-footnote">
          {pr.size}
        </span>
      </li>
    ))}
  </ol>
);
