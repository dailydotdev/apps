import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// Presentational scaffolding + the motion vocabulary shared by every milestone
// rewards story. Provider-free so the concepts render standalone, and built on
// theme tokens so the Storybook light/dark toggle keeps working.

const motionCss = `
/* Motion vocabulary. Two rules decide everything here:
   enter is opacity + blur + translateY on a decelerating curve with no
   overshoot, and nothing loops forever. A celebration is a rare moment, so it
   is allowed to be rich; it is not allowed to keep moving after it has landed. */
@keyframes mrRise {
  from { opacity: 0; transform: translateY(12px); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes mrBadgeIn {
  from { opacity: 0; transform: scale(0.86); filter: blur(10px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes mrDigit {
  from { opacity: 0; transform: translateY(60%); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes mrHalo {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 0.45; transform: none; }
}
@keyframes mrSweep {
  from { transform: translateX(-120%); }
  to { transform: translateX(220%); }
}
/* Embers rise off a live flame. Three passes, then the moment settles. */
@keyframes mrParticle {
  0% { opacity: 0; transform: scale(0.4) translateY(0); }
  30% { opacity: 1; transform: scale(1.1) translateY(-18px); }
  100% { opacity: 0; transform: scale(0.5) translateY(-52px); }
}
/* Ash falls off a broken one. Same machine, inverted, slower, colder. */
@keyframes mrAsh {
  0% { opacity: 0; transform: translateY(-8px) scale(0.9); }
  25% { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(30px) scale(0.7); }
}
@keyframes mrCta {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 22px 2px rgba(255, 255, 255, 0.3); }
}

.mr-rise { animation: mrRise 460ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--mr-delay, 0ms); will-change: transform, opacity, filter; }
.mr-badge-in { animation: mrBadgeIn 620ms cubic-bezier(0.16, 1, 0.3, 1) both; will-change: transform, opacity, filter; }
.mr-digit { animation: mrDigit 420ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--mr-delay, 0ms); }
.mr-halo { animation: mrHalo 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.mr-particle { animation: mrParticle var(--mr-duration, 1.6s) ease-out var(--mr-delay, 0ms) 3 both; opacity: 0; }
.mr-ash { animation: mrAsh var(--mr-duration, 3.2s) ease-in-out var(--mr-delay, 0ms) 3 both; opacity: 0; }
/* Draws the eye twice, then stops. An indefinite pulse is an advert. */
.mr-cta { animation: mrCta 2.6s ease-in-out 2; }
.mr-sweep::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
  animation: mrSweep 1100ms linear infinite;
}

/* Press feedback: 0.96, never lower, and only on things you actually press. */
.mr-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.mr-press:active { transform: scale(0.96); }

/* Depth from layered shadow rather than a hard edge. */
.mr-elevated {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.06),
    0 2px 6px -2px rgb(0 0 0 / 0.4),
    0 12px 32px -8px rgb(0 0 0 / 0.45);
}
/* Stops a logo on a white tile bleeding into the surface behind it. */
.mr-logo { outline: 1px solid rgb(0 0 0 / 0.08); outline-offset: -1px; }

.mr-balance { text-wrap: balance; }
.mr-pretty { text-wrap: pretty; }

/* Responsiveness is measured against the popup, not the viewport, so the same
   component collapses correctly inside a modal, a drawer or a story frame.
   Sizes interpolate with cqw so nothing snaps between breakpoints. */
.mr-shell { container-type: inline-size; }
.mr-flame { width: clamp(4.5rem, 20cqw, 9rem); height: clamp(4.5rem, 20cqw, 9rem); }
.mr-flame-sm { width: clamp(4.25rem, 19cqw, 6rem); height: clamp(4.25rem, 19cqw, 6rem); }
.mr-count { font-size: clamp(2.75rem, 8cqw, 4.5rem); line-height: 1.05; }
.mr-gift-card { width: clamp(13rem, 42cqw, 18rem); }
/* Number and label share one size and one colour, so the line reads as a
   single object next to the flame instead of two mismatched pieces. */
.mr-streak-line { font-size: clamp(1.5rem, 6.5cqw, 2.25rem); line-height: 1.1; }
.mr-only-narrow { display: none; }
/* The celebration panel owns its width in one place, so a popup that lands
   between the two layouts can hand the decision column room instead of
   overflowing it. */
.mr-side { width: var(--mr-side-width, 21rem); flex-shrink: 0; }
.mr-side-rail { --mr-side-width: 17rem; --mr-side-width-tight: 15rem; }
@container (max-width: 50rem) {
  .mr-side { width: var(--mr-side-width-tight, 18rem); }
}
@container (max-width: 44rem) {
  .mr-split { flex-direction: column; }
  .mr-side {
    width: 100%;
    border-right-width: 0;
    border-bottom-width: 1px;
  }
  /* Only the celebration panel centres when it goes full width. A list does
     not: its rows still read left to right against their icons. */
  .mr-side-center { text-align: center; }
  /* Gifts first on a narrow screen, the ladder underneath as context. */
  .mr-order-last { order: 2; border-bottom-width: 0; border-top-width: 1px; }
  .mr-side-pad { padding: 1.25rem; }
  .mr-rail { max-height: 11rem; overflow-y: auto; }
  .mr-only-wide { display: none; }
  .mr-only-narrow { display: block; }
}
@container (max-width: 28rem) {
  .mr-hide-tiny { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .mr-rise, .mr-badge-in, .mr-digit, .mr-halo { animation-duration: 1ms; animation-delay: 0ms; }
  .mr-sweep::after, .mr-particle, .mr-ash, .mr-cta { animation: none; }
  .mr-particle, .mr-ash { opacity: 0.6; }
  .mr-press { transition: none; }
}
`;

export const RewardMotion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: motionCss }} />
);

export const Page = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-6 pb-24 pt-8 text-text-primary tablet:px-10">
    <RewardMotion />
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-12">
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
    <h1 className="max-w-[40ch] typo-mega3">{title}</h1>
    {children && (
      <div className="flex max-w-[76ch] flex-col gap-3 text-text-tertiary typo-body">
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
        <div className="max-w-[76ch] text-text-tertiary typo-callout">
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

const toneToClassName: Record<CalloutTone, string> = {
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
      toneToClassName[tone],
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
      <div className="text-text-tertiary typo-footnote">{children}</div>
    )}
  </div>
);

/** A fake feed, blurred, so modals can be judged in the context they land in. */
export const FeedBackdrop = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 grid grid-cols-3 gap-4 overflow-hidden p-4 opacity-60 blur-[2px]"
  >
    {Array.from({ length: 9 }, (_, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
      >
        <div className="h-6 w-6 rounded-full bg-surface-hover" />
        <div className="h-3 w-full rounded-6 bg-surface-hover" />
        <div className="h-3 w-4/5 rounded-6 bg-surface-hover" />
        <div className="mt-auto h-20 w-full rounded-10 bg-surface-hover" />
      </div>
    ))}
  </div>
);

/**
 * A modal on top of the feed. Not the app `Modal`, because these are prototypes and
 * the real thing pulls in half the boot context. Production would use
 * `Modal` (Kind.FlexibleCenter, isDrawerOnMobile).
 */
export const Stage = ({
  children,
  height = 720,
  className,
}: {
  children: ReactNode;
  height?: number;
  className?: string;
}): ReactElement => (
  <div
    style={{ height }}
    className={classNames(
      'relative flex w-full items-center justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default',
      className,
    )}
  >
    <FeedBackdrop />
    <div className="absolute inset-0 bg-overlay-primary-pepper" />
    <div className="relative flex max-h-full w-full items-center justify-center overflow-y-auto p-6">
      {children}
    </div>
  </div>
);

/** A phone bezel, so the mobile variant is judged at the size it ships at. */
export const PhoneFrame = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  // An explicit width: the popups size themselves with w-full now, so a
  // fit-content frame would collapse them to nothing.
  <div className="w-[25rem] max-w-full rounded-[2.25rem] border-2 border-border-subtlest-tertiary bg-background-default p-2 shadow-3">
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
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[720px] border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-secondary typo-caption1"
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
