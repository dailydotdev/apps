import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export const img = (name: string): string => `/images/auth-popups/${name}.jpg`;

export const screen = (name: string, args?: string): string =>
  `auth-pop-ups-screens--${name}${args ? `&args=${args}` : ''}`;

export const Page = ({
  eyebrow,
  title,
  goal,
  children,
}: {
  eyebrow: string;
  title: string;
  goal: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-10">
      <header className="flex max-w-[52rem] flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">{eyebrow}</p>
        <h1 className="font-bold typo-title1">{title}</h1>
        <div className="text-text-secondary typo-callout">{goal}</div>
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
    <div className="flex max-w-[52rem] flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {note && <div className="text-text-tertiary typo-callout">{note}</div>}
    </div>
    {children}
  </section>
);

export const Labeled = ({
  label,
  tone = 'neutral',
  children,
  caption,
}: {
  label: string;
  tone?: 'production' | 'live' | 'neutral';
  caption?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption
      className={classNames(
        'self-start rounded-8 px-2 py-0.5 font-bold typo-caption1',
        tone === 'production' && 'bg-accent-cabbage-default text-white',
        tone === 'live' && 'bg-accent-avocado-default text-white',
        tone === 'neutral' && 'bg-surface-float text-text-secondary',
      )}
    >
      {label}
    </figcaption>
    {children}
    {caption && <p className="text-text-tertiary typo-footnote">{caption}</p>}
  </figure>
);

// Chapter pages embed many live screens, and each pulls hundreds of modules
// from the dev server. Started together, some requests fail and the frame
// lands on Storybook's error screen, so frames take turns: each starts once
// it is near the screen, two at a time.
const MAX_LOADING = 2;
const LOAD_TIMEOUT_MS = 20000;
let loading = 0;
const waiting: (() => void)[] = [];

const takeTurn = (start: () => void): void => {
  if (loading < MAX_LOADING) {
    loading += 1;
    start();
    return;
  }
  waiting.push(start);
};

const finishTurn = (): void => {
  loading -= 1;
  const next = waiting.shift();
  if (next) {
    loading += 1;
    next();
  }
};

// A real screen at a real viewport, scaled to its column. Breakpoints follow
// the viewport, so a narrow div would still get the desktop layout.
export const LiveFrame = ({
  storyId,
  title,
  width,
  height,
}: {
  storyId: string;
  title: string;
  width: number;
  height: number;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    let hasTurn = false;
    let isDone = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    const done = (): void => {
      if (hasTurn && !isDone) {
        isDone = true;
        finishTurn();
      }
      clearInterval(poll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        takeTurn(() => {
          hasTurn = true;
          setSrc(`iframe.html?id=${storyId}&viewMode=story`);
          const startedAt = Date.now();
          let hasRetried = false;
          poll = setInterval(() => {
            const body = frameRef.current?.contentDocument?.body;
            if (body?.classList.contains('sb-show-main')) {
              done();
            } else if (
              body?.classList.contains('sb-show-errordisplay') &&
              !hasRetried
            ) {
              hasRetried = true;
              frameRef.current?.contentWindow?.location.reload();
            } else if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
              done();
            }
          }, 300);
        });
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      done();
    };
  }, [storyId]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {src && (
        <iframe
          ref={frameRef}
          title={title}
          src={src}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
};

// The visible area of Safari on an iPhone 14, the size of the phone captures.
export const PHONE = { width: 390, height: 664 };
export const DESKTOP = { width: 1440, height: 900 };

export const Capture = ({
  name,
  alt,
}: {
  name: string;
  alt: string;
}): ReactElement => (
  <img
    src={img(name)}
    alt={alt}
    loading="lazy"
    className="w-full rounded-16 border border-border-subtlest-tertiary"
  />
);

// Phones in a row, desktops full width under them.
export const PhoneRow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-4">
    {children}
  </div>
);

export const DesktopRow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">{children}</div>
);

// One phone column beside a three-column desktop, for a single screen.
export const ScreenRow = ({
  phone,
  desktop,
}: {
  phone: ReactNode;
  desktop: ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-6 laptop:grid-cols-4">
    <div className="min-w-0">{phone}</div>
    <div className="min-w-0 laptop:col-span-3">{desktop}</div>
  </div>
);

// A real screen live at both sizes, side by side.
export const LiveScreen = ({
  id,
  title,
}: {
  id: string;
  title: string;
}): ReactElement => (
  <ScreenRow
    phone={
      <Labeled label="Live · phone" tone="live">
        <LiveFrame
          storyId={screen(id)}
          title={`${title} on a phone`}
          {...PHONE}
        />
      </Labeled>
    }
    desktop={
      <Labeled label="Live · desktop" tone="live">
        <LiveFrame
          storyId={screen(id)}
          title={`${title} on desktop`}
          {...DESKTOP}
        />
      </Labeled>
    }
  />
);

export type Verdict = 'same' | 'differs' | 'missing';

export interface CompareRow {
  aspect: string;
  cells: ReactNode[];
  verdict?: Verdict;
}

const verdictLabel: Record<Verdict, string> = {
  same: 'Same',
  differs: 'Differs',
  missing: 'Missing',
};

export const CompareTable = ({
  columns,
  rows,
  firstColumn = 'Aspect',
}: {
  columns: string[];
  rows: CompareRow[];
  firstColumn?: string;
}): ReactElement => {
  const hasVerdicts = rows.some(({ verdict }) => verdict);

  return (
    <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
      <table className="w-full min-w-[56rem] border-collapse text-left typo-footnote">
        <thead>
          <tr className="bg-surface-float">
            <th className="w-40 px-4 py-3 font-bold text-text-tertiary">
              {firstColumn}
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 font-bold text-text-tertiary"
              >
                {column}
              </th>
            ))}
            {hasVerdicts && (
              <th className="w-24 px-4 py-3 font-bold text-text-tertiary">
                Verdict
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ aspect, cells, verdict }) => (
            <tr
              key={aspect}
              className="border-t border-border-subtlest-tertiary align-top"
            >
              <td className="px-4 py-3 font-bold text-text-primary">
                {aspect}
              </td>
              {cells.map((cell, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={index} className="px-4 py-3 text-text-secondary">
                  {cell}
                </td>
              ))}
              {hasVerdicts && (
                <td className="px-4 py-3">
                  {verdict && (
                    <span
                      className={classNames(
                        'rounded-8 px-2 py-0.5 font-bold typo-caption1',
                        verdict === 'same' &&
                          'bg-overlay-float-avocado text-accent-avocado-default',
                        verdict === 'differs' &&
                          'bg-overlay-float-cheese text-accent-cheese-default',
                        verdict === 'missing' &&
                          'bg-overlay-float-ketchup text-accent-ketchup-default',
                      )}
                    >
                      {verdictLabel[verdict]}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface Finding {
  title: string;
  detail: ReactNode;
  where: string;
}

export const Findings = ({ items }: { items: Finding[] }): ReactElement => (
  <ol className="flex flex-col gap-3">
    {items.map(({ title, detail, where }, index) => (
      <li
        key={title}
        className="flex gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-surface-float font-bold typo-footnote">
          {index + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-bold typo-callout">{title}</p>
          <div className="text-text-secondary typo-callout">{detail}</div>
          <p className="text-text-quaternary typo-caption1">{where}</p>
        </div>
      </li>
    ))}
  </ol>
);

export const Code = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="rounded-6 bg-surface-float px-1 font-mono typo-footnote">
    {children}
  </code>
);
