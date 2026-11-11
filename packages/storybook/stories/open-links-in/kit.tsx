import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// The review page pieces, lifted from the mobile-ux review workspace's kit
// (which stays out of the repository): page, sections, phone frame, tables
// and callouts, so this chapter reads like its siblings.

const motionCss = `
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
            className={classNames(
              'w-[0.1875rem] rounded-2',
              light ? 'bg-white' : 'bg-text-primary',
            )}
            style={{ height }}
          />
        ))}
      </span>
      <span
        className={classNames(
          'ml-1 h-3 w-6 rounded-4 border p-px',
          light ? 'border-white' : 'border-text-primary',
        )}
      >
        <span
          className={classNames(
            'block h-full w-3/4 rounded-2',
            light ? 'bg-white' : 'bg-text-primary',
          )}
        />
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
      {statusBar && (
        <StatusBar overlay={immersive} light={immersive && statusLight} />
      )}
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      {browser === BrowserChrome.Safari && <SafariChrome host={host} />}
      {browser === BrowserChrome.Chrome && <ChromeChrome host={host} />}
    </div>
  );
};

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
  [ChapterStatus.Decided]:
    'bg-overlay-float-avocado text-accent-avocado-default',
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
    <span className="text-text-quaternary typo-caption1">
      Last changed in round {round}
    </span>
    <span className="min-w-0 flex-1 text-text-secondary typo-footnote">
      {children}
    </span>
  </div>
);
