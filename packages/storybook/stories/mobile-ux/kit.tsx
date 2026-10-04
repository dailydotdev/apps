import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { linkTo } from '@storybook/addon-links';

const motionCss = `
@keyframes mapSheetIn {
  from { transform: translateY(100%); }
  to { transform: none; }
}
@keyframes mapFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes mapRise {
  from { opacity: 0; transform: translateY(12px); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.map-sheet-in { animation: mapSheetIn 420ms cubic-bezier(0.32, 0.72, 0, 1) both; }
.map-fade-in { animation: mapFadeIn 260ms ease-out both; }
.map-rise { animation: mapRise 420ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--map-delay, 0ms); }
.map-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.map-press:active { transform: scale(0.96); }
.map-elevated {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.06),
    0 2px 6px -2px rgb(0 0 0 / 0.4),
    0 16px 40px -8px rgb(0 0 0 / 0.5);
}
/* The X-style tapping hand. One 2.4s cycle: slide in from below-right, tap
   twice, rest on the button. Three cycles, then it stays put. */
@keyframes mapHandTap {
  0% { opacity: 0; transform: translate(18px, 24px); }
  18% { opacity: 1; transform: translate(0, 0); }
  28% { transform: translate(-3px, -4px) scale(0.9); }
  36% { transform: translate(0, 0) scale(1); }
  44% { transform: translate(-3px, -4px) scale(0.9); }
  52%, 100% { opacity: 1; transform: translate(0, 0) scale(1); }
}
@keyframes mapRipple {
  0%, 26% { opacity: 0; transform: scale(0.2); }
  30% { opacity: 0.7; transform: scale(0.5); }
  50%, 100% { opacity: 0; transform: scale(1.6); }
}
@keyframes mapPress {
  0%, 26% { transform: none; }
  30% { transform: scale(0.97); }
  36% { transform: none; }
  44% { transform: scale(0.97); }
  50%, 100% { transform: none; }
}
.map-hand, .map-ripple, .map-tap-press {
  animation-duration: 2.4s;
  animation-delay: var(--map-hand-delay, 700ms);
  animation-iteration-count: var(--map-hand-loops, 3);
  animation-fill-mode: both;
}
.map-hand { animation-name: mapHandTap; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
.map-ripple { animation-name: mapRipple; animation-timing-function: ease-out; }
.map-tap-press { animation-name: mapPress; animation-timing-function: ease-out; }
/* Charm climbs up from behind the button once, then presses it in time with
   the button's own dip. */
@keyframes mapCharmRise {
  from { transform: translateY(70%); filter: blur(4px); }
  to { transform: none; filter: blur(0); }
}
@keyframes mapCharmPress {
  0%, 26% { transform: none; }
  30% { transform: translateY(7%); }
  36% { transform: none; }
  44% { transform: translateY(7%); }
  50%, 100% { transform: none; }
}
.map-charm-rise { animation: mapCharmRise 700ms cubic-bezier(0.16, 1, 0.3, 1) 150ms both; }
.map-charm-press {
  animation: mapCharmPress 2.4s ease-out var(--map-hand-delay, 700ms) var(--map-hand-loops, 3) both;
}
@media (prefers-reduced-motion: reduce) {
  .map-hand, .map-ripple, .map-tap-press, .map-charm-rise, .map-charm-press { animation: none; }
}
.map-scroll-none { scrollbar-width: none; }
.map-scroll-none::-webkit-scrollbar { display: none; }
`;

export const Motion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: motionCss }} />
);

export const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-6 pb-24 pt-8 text-text-primary tablet:px-10">
    <Motion />
    <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-14">
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
    <h1 className="max-w-[40ch] font-bold typo-mega3">{title}</h1>
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
      <h2 className="font-bold typo-title2">{title}</h2>
      {description && (
        <div className="max-w-[76ch] text-text-tertiary typo-callout">
          {description}
        </div>
      )}
    </div>
    {children}
  </section>
);

export enum Verdict {
  Ship = 'ship',
  Skip = 'skip',
}

const verdictToClassName: Record<Verdict, string> = {
  [Verdict.Ship]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [Verdict.Skip]: 'bg-surface-float text-text-tertiary',
};

const verdictToLabel: Record<Verdict, string> = {
  [Verdict.Ship]: 'Recommended',
  [Verdict.Skip]: 'Reference only',
};

export const VerdictPill = ({
  verdict,
}: {
  verdict: Verdict;
}): ReactElement => (
  <span
    className={classNames(
      'rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
      verdictToClassName[verdict],
    )}
  >
    {verdictToLabel[verdict]}
  </span>
);

export const Cell = ({
  label,
  note,
  verdict,
  children,
  className,
}: {
  label: string;
  note?: ReactNode;
  verdict?: Verdict;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-3', className)}>
    <div className="flex max-w-[23.5rem] flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-text-primary typo-callout">
          {label}
        </span>
        {verdict && <VerdictPill verdict={verdict} />}
      </div>
      {note && <span className="text-text-tertiary typo-footnote">{note}</span>}
    </div>
    {children}
  </div>
);

export const PhoneRow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-x-8 gap-y-12">{children}</div>
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
      {tone !== CalloutTone.Neutral && (
        <span
          className={classNames(
            'rounded-6 px-1.5 py-0.5 uppercase tracking-wide typo-caption2',
            tone === CalloutTone.Good
              ? 'bg-overlay-float-avocado text-accent-avocado-default'
              : 'bg-overlay-float-ketchup text-accent-ketchup-default',
          )}
        >
          {tone === CalloutTone.Good ? 'Do' : "Don't"}
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
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[60rem] border-collapse text-left">
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
                className="px-4 py-3 text-text-secondary typo-footnote"
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

export enum BrowserChrome {
  Safari = 'safari',
  Chrome = 'chrome',
  None = 'none',
}

// `light` draws the status bar in white for content that runs under it
// (a cover image); `overlay` takes it out of the flow so content can.
const StatusBar = ({
  light,
  overlay,
}: {
  light?: boolean;
  overlay?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex h-11 shrink-0 items-center justify-between px-7 font-bold typo-callout transition-colors duration-200',
      light ? 'text-white' : 'text-text-primary',
      overlay ? 'pointer-events-none absolute inset-x-0 top-0 z-3' : 'relative',
    )}
    style={overlay ? undefined : { zIndex: 4 }}
  >
    <span className="tabular-nums">9:41</span>
    <span className="flex items-center gap-1.5">
      <span className="flex items-end gap-0.5">
        {[4, 6, 8, 10].map((height) => (
          <span
            key={height}
            className={classNames('w-[0.1875rem] rounded-2', light ? 'bg-white' : 'bg-text-primary')}
            style={{ height }}
          />
        ))}
      </span>
      <span className={classNames('ml-1 h-3 w-6 rounded-4 border p-px', light ? 'border-white' : 'border-text-primary')}>
        <span className={classNames('block h-full w-3/4 rounded-2', light ? 'bg-white' : 'bg-text-primary')} />
      </span>
    </span>
  </div>
);

const SafariChrome = ({ host }: { host: string }): ReactElement => (
  <div className="flex shrink-0 flex-col gap-2 border-t border-border-subtlest-tertiary bg-background-subtle px-4 pb-6 pt-2">
    <div className="flex h-10 items-center justify-center gap-1.5 rounded-12 bg-surface-float text-text-secondary typo-callout">
      <span className="text-text-quaternary typo-caption1">AA</span>
      <span className="mx-auto">{host}</span>
      <span className="text-text-quaternary typo-caption1">↻</span>
    </div>
    <div className="flex justify-between px-2 text-text-tertiary typo-title3">
      <span>‹</span>
      <span className="opacity-50">›</span>
      <span>⇪</span>
      <span>▢</span>
      <span>⧉</span>
    </div>
  </div>
);

const ChromeChrome = ({ host }: { host: string }): ReactElement => (
  <div className="flex shrink-0 items-center gap-3 border-t border-border-subtlest-tertiary bg-background-subtle px-4 pb-6 pt-2">
    <span className="text-text-tertiary typo-title3">←</span>
    <div className="flex h-10 flex-1 items-center justify-center rounded-max bg-surface-float text-text-secondary typo-callout">
      {host}
    </div>
    <span className="text-text-tertiary typo-title3">⋯</span>
  </div>
);

interface PhoneProps {
  children: ReactNode;
  browser?: BrowserChrome;
  width?: number;
  // A landscape phone hides the status bar, as iOS does in most apps.
  statusBar?: boolean;
  host?: string;
  height?: number;
  zoom?: number;
  className?: string;
  immersive?: boolean;
  statusLight?: boolean;
  device?: boolean;
}

// Content inside is laid out as if `position: fixed` meant "fixed to the
// viewport": the viewport is the relative box between status bar and browser
// chrome, so overlays use `absolute` against it.
export const Phone = ({
  children,
  browser = BrowserChrome.Safari,
  host = 'app.daily.dev',
  height = 780,
  width = 375,
  zoom,
  className,
  immersive,
  statusLight,
  device,
  statusBar = true,
}: PhoneProps): ReactElement => {
  const style: CSSProperties = { width, height };

  // On a real device (the Device stories opened on a phone or the
  // simulator) the viewport is the phone: no bezel, no mock status bar, no
  // mock browser chrome.
  if (device) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-background-default text-text-primary">
        {children}
      </div>
    );
  }

  if (zoom) {
    style.zoom = zoom;
  }

  return (
    <div
      style={style}
      className={classNames(
        'relative flex shrink-0 flex-col overflow-hidden rounded-[2.75rem] border-[0.375rem] border-border-subtlest-secondary bg-background-default text-text-primary shadow-3',
        className,
      )}
    >
      {statusBar && <StatusBar overlay={immersive} light={immersive && statusLight} />}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {browser === BrowserChrome.Safari && <SafariChrome host={host} />}
      {browser === BrowserChrome.Chrome && <ChromeChrome host={host} />}
    </div>
  );
};

export const Annotation = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'max-w-[23.5rem] text-text-tertiary typo-footnote',
      className,
    )}
  >
    {children}
  </div>
);

export const chapters = [
  { id: '0', title: 'Start here', story: 'Mobile UX/0. Start here' },
  { id: '1', title: 'Today', story: 'Mobile UX/1. Today' },
  { id: '2', title: 'Research', story: 'Mobile UX/2. Research' },
  { id: '3', title: 'Tab bar', story: 'Mobile UX/3. Tab bar' },
  { id: '3b', title: 'Floating chrome', story: 'Mobile UX/3b. Floating chrome' },
  { id: '3c', title: 'Search', story: 'Mobile UX/3c. Search' },
  { id: '3d', title: 'Create', story: 'Mobile UX/3d. Create' },
  { id: '4', title: 'Header', story: 'Mobile UX/4. Header' },
  { id: '4b', title: 'Every page', story: 'Mobile UX/4b. Every page' },
  { id: '4c', title: 'Tabs everywhere', story: 'Mobile UX/4c. Tabs everywhere' },
  { id: '4d', title: 'Page titles', story: 'Mobile UX/4d. Page titles' },
  { id: '4e', title: 'Scroll behaviour', story: 'Mobile UX/4e. Scroll behaviour' },
  { id: '5', title: 'Navigation model', story: 'Mobile UX/5. Navigation model' },
  { id: '6', title: 'Post page', story: 'Mobile UX/6. Post page' },
  { id: '6b', title: 'Reading the link', story: 'Mobile UX/6b. Reading the link' },
  { id: '7', title: 'Gestures and feel', story: 'Mobile UX/7. Gestures and feel' },
  { id: '8', title: 'Native wrappers', story: 'Mobile UX/8. Native wrappers' },
  { id: '9', title: 'Roadmap', story: 'Mobile UX/9. Roadmap' },
  { id: '9b', title: 'Open calls', story: 'Mobile UX/9b. Open calls' },
  { id: '9c', title: 'Avatar on the left', story: 'Mobile UX/9c. Avatar on the left' },
  { id: '9d', title: 'Streak, settings, forms', story: 'Mobile UX/9d. Streak, settings and forms' },
  { id: '9e', title: 'Last pass', story: 'Mobile UX/9e. Last pass' },
  { id: '9f', title: 'Ads and the arbitrage page', story: 'Mobile UX/9f. Ads and the arbitrage page' },
  { id: '9g', title: 'Landscape', story: 'Mobile UX/9g. Landscape' },
  { id: '9h', title: 'Bottom prompts', story: 'Mobile UX/9h. Bottom prompts' },
  { id: '9i', title: 'The phases, explained', story: 'Mobile UX/9i. The phases, explained' },
  { id: '9j', title: 'Keep it working', story: 'Mobile UX/9j. Keep it working' },
  { id: '9k', title: 'Plus on Home', story: 'Mobile UX/9k. Plus on Home' },
  { id: '9l', title: 'Feel', story: 'Mobile UX/9l. Feel' },
  { id: '10', title: 'The build', story: 'Mobile UX/10. The build' },
];

// Everything rejected, superseded or parked during the review, kept with
// the decision that retired it. Not chapters: nobody builds from these.
export const archiveStories = [
  { title: 'Round one questions', story: 'Mobile UX/Archive/Round one questions' },
  { title: 'Tab bar, chrome, search and create', story: 'Mobile UX/Archive/Tab bar, chrome, search and create' },
  { title: 'Headers, titles and covers', story: 'Mobile UX/Archive/Headers, titles and covers' },
  { title: 'Tab rows and segments', story: 'Mobile UX/Archive/Tab rows and segments' },
  { title: 'Scroll arms, post page and reading', story: 'Mobile UX/Archive/Scroll arms, post page and reading' },
  { title: 'Earlier plans', story: 'Mobile UX/Archive/Earlier plans' },
  { title: 'Later calls', story: 'Mobile UX/Archive/Later calls' },
];

export const ArchiveNav = (): ReactElement => (
  <nav className="flex flex-wrap items-center gap-2">
    <span className="pr-1 font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption2">Archive</span>
    {archiveStories.map((entry) => (
      <button
        key={entry.story}
        type="button"
        onClick={linkTo(entry.story)}
        className="rounded-10 border border-dashed border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
      >
        {entry.title}
      </button>
    ))}
  </nav>
);

export const ChapterNav = ({ current }: { current: string }): ReactElement => (
  <nav className="flex flex-wrap gap-2">
    {chapters.map((chapter) => (
      <button
        key={chapter.id}
        type="button"
        onClick={linkTo(chapter.story)}
        className={classNames(
          'rounded-10 border px-3 py-1.5 font-bold typo-footnote',
          chapter.id === current
            ? 'border-text-primary bg-text-primary text-surface-invert'
            : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
        )}
      >
        {chapter.id}. {chapter.title}
      </button>
    ))}
  </nav>
);

export const Goal = ({
  goal,
  metric,
}: {
  goal: ReactNode;
  metric: ReactNode;
}): ReactElement => (
  <div className="grid gap-3 tablet:grid-cols-2">
    <div className="rounded-16 border border-border-subtlest-tertiary p-4">
      <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
        Chapter goal
      </span>
      <p className="mt-1 text-text-primary typo-callout">{goal}</p>
    </div>
    <div className="rounded-16 border border-border-subtlest-tertiary p-4">
      <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
        How we know it worked
      </span>
      <p className="mt-1 text-text-primary typo-callout">{metric}</p>
    </div>
  </div>
);

export const Shot = ({
  src,
  label,
  note,
  width = 300,
  className,
}: {
  src: string;
  label: string;
  note?: ReactNode;
  width?: number;
  className?: string;
}): ReactElement => (
  <figure
    className={classNames('flex shrink-0 flex-col gap-3', className)}
    style={{ width }}
  >
    <img
      src={src}
      alt={label}
      width={width}
      className="rounded-24 border border-border-subtlest-tertiary"
    />
    <figcaption className="flex flex-col gap-1">
      <span className="font-bold typo-callout">{label}</span>
      {note && <span className="text-text-tertiary typo-footnote">{note}</span>}
    </figcaption>
  </figure>
);

export const Metric = ({
  label,
  baseline,
  target,
}: {
  label: string;
  baseline: string;
  target: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-12 bg-surface-float px-4 py-3">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span className="font-bold tabular-nums typo-title3">
      {baseline}
      <span className="mx-2 text-text-quaternary">to</span>
      {target}
    </span>
  </div>
);

export enum Severity {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

const severityToClassName: Record<Severity, string> = {
  [Severity.High]: 'bg-overlay-float-ketchup text-accent-ketchup-default',
  [Severity.Medium]: 'bg-overlay-float-bun text-accent-bun-default',
  [Severity.Low]: 'bg-surface-float text-text-tertiary',
};

export const SeverityPill = ({
  severity,
}: {
  severity: Severity;
}): ReactElement => (
  <span
    className={classNames(
      'rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
      severityToClassName[severity],
    )}
  >
    {severity}
  </span>
);

export enum Feasibility {
  Web = 'web',
  IosBridge = 'ios bridge',
  Android = 'android wrapper',
  Native = 'native only',
}

const feasibilityToClassName: Record<Feasibility, string> = {
  [Feasibility.Web]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [Feasibility.IosBridge]: 'bg-overlay-float-blueCheese text-accent-blueCheese-default',
  [Feasibility.Android]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [Feasibility.Native]: 'bg-surface-float text-text-tertiary',
};

export const FeasibilityPill = ({
  feasibility,
}: {
  feasibility: Feasibility;
}): ReactElement => (
  <span
    className={classNames(
      'rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
      feasibilityToClassName[feasibility],
    )}
  >
    {feasibility}
  </span>
);

export const DigIn = ({
  title = 'Dig in',
  children,
}: {
  title?: string;
  children: ReactNode;
}): ReactElement => (
  <details className="group rounded-12 border border-border-subtlest-tertiary">
    <summary className="cursor-pointer list-none px-4 py-3 font-bold typo-callout marker:hidden">
      <span className="mr-2 inline-block transition-transform group-open:rotate-90">
        ›
      </span>
      {title}
    </summary>
    <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary px-4 py-4 text-text-secondary typo-footnote">
      {children}
    </div>
  </details>
);

export const Quote = ({ children }: { children: ReactNode }): ReactElement => (
  <blockquote className="border-l-2 border-accent-cabbage-default pl-4 text-text-primary typo-title3">
    {children}
  </blockquote>
);

export const Row = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="grid gap-1 border-b border-border-subtlest-tertiary py-2 last:border-b-0 tablet:grid-cols-[10rem_1fr]">
    <span className="text-text-tertiary typo-footnote">{label}</span>
    <span className="text-text-secondary typo-footnote">{children}</span>
  </div>
);

export const Compare = ({
  before,
  after,
  beforeLabel = 'Today',
  afterLabel = 'Proposed',
}: {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
    <div className="flex flex-col gap-3">
      <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
        {beforeLabel}
      </span>
      {before}
    </div>
    <div className="flex flex-col gap-3">
      <span className="font-bold uppercase tracking-[0.16em] text-accent-cabbage-default typo-caption2">
        {afterLabel}
      </span>
      {after}
    </div>
  </div>
);

export const Source = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-text-link underline decoration-border-subtlest-secondary underline-offset-2 hover:decoration-text-link"
  >
    {children}
  </a>
);

export enum ChapterStatus {
  Decided = 'decided',
  Open = 'open',
  Reference = 'reference',
}

const statusToClassName: Record<ChapterStatus, string> = {
  [ChapterStatus.Decided]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [ChapterStatus.Open]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [ChapterStatus.Reference]: 'bg-surface-float text-text-tertiary',
};

export const Status = ({
  status,
  round,
  children,
}: {
  status: ChapterStatus;
  round: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-wrap items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-4 py-3">
    <span
      className={classNames(
        'rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
        statusToClassName[status],
      )}
    >
      {status}
    </span>
    <span className="text-text-quaternary typo-caption1">Last changed in round {round}</span>
    <span className="min-w-0 flex-1 text-text-secondary typo-footnote">{children}</span>
  </div>
);
