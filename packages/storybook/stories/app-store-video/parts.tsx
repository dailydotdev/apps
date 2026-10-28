import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { FeedHeroProviders } from '../features/feed/feedHero.mocks';

// The review's scaffold, shared with the other initiative Storybooks: a
// chapter header (its question, goal and metric), cases below it, and the
// tables and canvases the App Store pages need.

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
  <FeedHeroProviders>
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
  </FeedHeroProviders>
);

export const Case = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex max-w-[56rem] flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
      {!!note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    {children}
  </section>
);

/** A row of short conclusions, the way a chapter opens. */
export const Verdicts = ({
  items,
}: {
  items: { label: string; text: string; tone?: 'good' | 'warn' | 'bad' }[];
}): ReactElement => (
  <ul className="grid max-w-[64rem] gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
    {items.map(({ label, text, tone }) => (
      <li
        key={label}
        className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
      >
        <span
          className={classNames(
            'font-bold typo-callout',
            tone === 'good' && 'text-accent-avocado-default',
            tone === 'warn' && 'text-accent-cheese-default',
            tone === 'bad' && 'text-accent-ketchup-default',
            !tone && 'text-text-primary',
          )}
        >
          {label}
        </span>
        <span className="text-text-secondary typo-footnote">{text}</span>
      </li>
    ))}
  </ul>
);

export const Table = ({
  head,
  rows,
  className,
}: {
  head: string[];
  rows: ReactNode[][];
  className?: string;
}): ReactElement => (
  <div className={classNames('overflow-x-auto', className)}>
    <table className="w-full min-w-[40rem] border-collapse text-left typo-footnote">
      <thead>
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="border-b border-border-subtlest-secondary py-2 pr-4 font-bold text-text-tertiary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={rowIndex} className="align-top">
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'border-b border-border-subtlest-tertiary py-2 pr-4 text-text-secondary',
                  cellIndex === 0 && 'font-bold text-text-primary',
                )}
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

export const Bullets = ({ items }: { items: ReactNode[] }): ReactElement => (
  <ul className="flex max-w-[56rem] list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-callout">
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index}>{item}</li>
    ))}
  </ul>
);

export const Sources = ({
  items,
}: {
  items: { label: string; href: string }[];
}): ReactElement => (
  <ul className="flex max-w-[56rem] flex-wrap gap-x-4 gap-y-1 typo-caption1">
    {items.map(({ label, href }) => (
      <li key={href}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-text-link underline-offset-2 hover:underline"
        >
          {label}
        </a>
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------------------ */
/* Canvases                                                            */
/* ------------------------------------------------------------------ */

export type Placement = 'header' | 'search' | 'preview';

/** Apple's accepted sizes, and the safe rectangle measured off its Sketch
 * template (the share of each side the key art may use). */
export const placements: Record<
  Placement,
  {
    label: string;
    ratio: string;
    pixels: string;
    width: number;
    height: number;
    safe?: { width: number; height: number };
  }
> = {
  header: {
    label: 'Product page header · 21:9',
    ratio: '21 / 9',
    pixels: '3840 × 1646',
    width: 1120,
    height: 480,
    safe: { width: 0.43, height: 0.4 },
  },
  search: {
    label: 'Search results · 3:2',
    ratio: '3 / 2',
    pixels: '1920 × 1280 to 3840 × 2560',
    width: 900,
    height: 600,
    safe: { width: 0.565, height: 0.4 },
  },
  preview: {
    label: 'App preview · 9:16',
    ratio: '886 / 1920',
    pixels: '886 × 1920',
    width: 360,
    height: 780,
  },
};

/**
 * Whether the Storybook canvas is in its light theme. Store art is dark on
 * every device, so a canvas flips itself back with the theme's `invert`.
 */
export const useIsLight = (): boolean => {
  const [isLight, setIsLight] = useState(() =>
    document.documentElement.classList.contains('light'),
  );
  useEffect(() => {
    const sync = () =>
      setIsLight(document.documentElement.classList.contains('light'));
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true });
    sync();
    return () => observer.disconnect();
  }, []);
  return isLight;
};

/** The store covers' aurora: the brand's violet and amber washed over a
 * near-black canvas, grain-free so it compresses cleanly as video. */
export const auroraStyle: CSSProperties = {
  backgroundColor: 'var(--theme-background-default)',
  backgroundImage: [
    'radial-gradient(60% 90% at 18% 20%, color-mix(in srgb, var(--theme-accent-cabbage-default) 34%, transparent), transparent 70%)',
    'radial-gradient(50% 70% at 85% 80%, color-mix(in srgb, var(--theme-accent-onion-default) 30%, transparent), transparent 70%)',
    'radial-gradient(35% 45% at 70% 15%, color-mix(in srgb, var(--theme-accent-cheese-default) 14%, transparent), transparent 70%)',
    'linear-gradient(180deg, color-mix(in srgb, var(--theme-background-default) 92%, var(--theme-accent-cabbage-default)), var(--theme-background-default))',
  ].join(', '),
};

/** Dark whatever the page theme, no aurora: the phone of a preview frame. */
export const Dark = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => {
  const isLight = useIsLight();
  return (
    <div className={classNames(isLight && 'invert', className)}>{children}</div>
  );
};

/** A dark canvas whatever the page theme: the aurora, flipped back to dark
 * when Storybook is light. */
export const DarkArt = ({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}): ReactElement => {
  const isLight = useIsLight();
  return (
    <div
      data-art
      className={classNames(
        'relative overflow-hidden text-text-primary',
        isLight && 'invert',
        className,
      )}
      style={{ ...auroraStyle, ...style }}
    >
      {children}
    </div>
  );
};

/**
 * One frame of a placement at Apple's aspect ratio, authored at a fixed
 * width and scrolled sideways when the canvas is narrower. `safe` draws the
 * template's safe rectangle over it.
 */
export const Canvas = ({
  placement,
  safe,
  label,
  note,
  children,
  id,
}: {
  placement: Placement;
  safe?: boolean;
  label?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  id?: string;
}): ReactElement => {
  const { width, height, ratio, safe: safeArea } = placements[placement];
  return (
    <figure id={id} className="flex min-w-0 flex-col gap-2" data-frame>
      {(label || note) && (
        <figcaption className="flex items-baseline justify-between gap-4">
          {label && (
            <span className="font-bold text-text-tertiary typo-caption1">
              {label}
            </span>
          )}
          {note && (
            <span className="text-text-quaternary typo-caption1">{note}</span>
          )}
        </figcaption>
      )}
      <div className="no-scrollbar overflow-x-auto">
        <DarkArt
          className="shrink-0 rounded-16 border border-border-subtlest-tertiary"
          style={{ width, height, aspectRatio: ratio }}
        >
          {children}
          {safe && safeArea && (
            <div
              aria-hidden
              className="pointer-events-none absolute border border-dashed border-accent-cheese-default"
              style={{
                left: `${((1 - safeArea.width) / 2) * 100}%`,
                top: `${((1 - safeArea.height) / 2) * 100}%`,
                width: `${safeArea.width * 100}%`,
                height: `${safeArea.height * 100}%`,
              }}
            >
              <span className="absolute -top-5 left-0 whitespace-nowrap text-accent-cheese-default typo-caption2">
                safe area
              </span>
            </div>
          )}
        </DarkArt>
      </div>
    </figure>
  );
};

/** A checkbox that shows the safe rectangle on every canvas below it. */
export const useSafeToggle = (): [boolean, ReactElement] => {
  const [safe, setSafe] = useState(true);
  const toggle = (
    <label className="flex w-fit items-center gap-2 text-text-secondary typo-callout">
      <input
        type="checkbox"
        checked={safe}
        onChange={(event) => setSafe(event.target.checked)}
      />
      Show the safe area Apple&apos;s template defines
    </label>
  );
  return [safe, toggle];
};

/** A storyboard: frames in time order, each with its timestamp and what
 * moves between it and the next. */
export const Storyboard = ({
  frames,
}: {
  frames: { at: string; motion: ReactNode; frame: ReactNode }[];
}): ReactElement => (
  <ol className="flex flex-col gap-8">
    {frames.map(({ at, motion, frame }) => (
      <li key={at} className="flex flex-col gap-2">
        <div className="flex max-w-[56rem] items-baseline gap-3">
          <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold tabular-nums text-text-primary typo-caption1">
            {at}
          </span>
          <span className="text-text-secondary typo-callout">{motion}</span>
        </div>
        {frame}
      </li>
    ))}
  </ol>
);
