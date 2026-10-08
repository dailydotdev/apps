import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RealCard, realPosts } from './swap';
import { ALL_CONCEPTS } from './concepts';
import { GEOMETRY } from './shell';

/**
 * The widest counts a post can show in each slot: four-digit-plus upvotes,
 * three-digit comments and six-character impressions in production's format
 * ("9.9K", "999", "999.9K"). Variants using the 1.7K / 234K rule print
 * "9.9K", "999" and "999K".
 */
const stressPost = {
  ...realPosts[2],
  id: 'stress',
  numUpvotes: 9_950,
  numComments: 999,
  analytics: { impressions: 999_900 },
} as (typeof realPosts)[number];

/* ------------------------------------------------------------------------ */
/* The narrowest card each gap produces, across every breakpoint             */
/* ------------------------------------------------------------------------ */

/**
 * Columns switch at these widths of the area left after the sidebar
 * (FeedContext `eco`). The smallest card for n columns is right at the
 * switch: (breakpoint − 2 × 40px margins − (n − 1) × gap) / n. The sidebar
 * cancels out, so this holds with it open or closed.
 */
const SWITCHES: [number, number][] = [
  [1020, 3],
  [1360, 4],
  [1668, 5],
  [1976, 6],
];

export const GAPS = [32, 24, 20, 16];

export const narrowest = (gap: number) =>
  SWITCHES.map(([bp, n]) => ({
    n,
    width: (bp - 2 * GEOMETRY.padding - (n - 1) * gap) / n,
  })).reduce((min, c) => (c.width < min.width ? c : min));

/* ------------------------------------------------------------------------ */
/* Measuring: the smallest card width at which a bar still fits              */
/* ------------------------------------------------------------------------ */

export const overflows = (card: HTMLElement): boolean => {
  const article = card.querySelector('article');
  const bar =
    card.querySelector('[data-bar]') ??
    card.querySelector('[id$="-upvote-btn"]')?.closest('.justify-between');
  if (!article || !bar) {
    return false;
  }
  const edge = article.getBoundingClientRect().right;
  return Array.from(bar.querySelectorAll('*')).some(
    (el) => el.getBoundingClientRect().right > edge + 0.5,
  );
};

/** Binary search on the wrapper's width (buttons never shrink, so this is monotonic). */
const minWidth = (wrapper: HTMLElement): number => {
  let lo = 200;
  let hi = 420;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    wrapper.style.width = `${mid}px`;
    if (overflows(wrapper)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  wrapper.style.width = '';
  return Math.ceil(hi);
};

interface Result {
  id: string;
  worst: number;
  worstTitle: string;
  median: number;
  stress: number;
  /** Largest card-height difference from today's card, same post and width. */
  taller: number;
}

/** Same width for the height comparison: the narrowest card today. */
const HEIGHT_WIDTH = 292;

const cardHeight = (cell: HTMLElement): number => {
  cell.style.width = `${HEIGHT_WIDTH}px`;
  const h = cell.querySelector('article')?.getBoundingClientRect().height ?? 0;
  cell.style.width = '';
  return h;
};

const Measure = ({
  onDone,
}: {
  onDone: (results: Result[]) => void;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Let counters, fonts and the swapped bars settle first.
    const timer = window.setTimeout(() => {
      const root = ref.current;
      if (!root) {
        return;
      }
      const todayHeights = Array.from(
        root.querySelectorAll<HTMLElement>('[data-fit="today"]'),
      ).map(cardHeight);
      const results = ALL_CONCEPTS.map((concept) => {
        const cells = Array.from(
          root.querySelectorAll<HTMLElement>(`[data-fit="${concept.id}"]`),
        );
        const stressCell = root.querySelector<HTMLElement>(
          `[data-stress="${concept.id}"]`,
        );
        const widths = cells.map((cell) => ({
          w: minWidth(cell),
          title: cell.dataset.title ?? '',
        }));
        const sorted = [...widths].sort((x, y) => x.w - y.w);
        const worst = sorted[sorted.length - 1];
        return {
          id: concept.id,
          worst: worst.w,
          worstTitle: worst.title,
          median: sorted[Math.floor(sorted.length / 2)].w,
          stress: stressCell ? minWidth(stressCell) : 0,
          taller: Math.round(
            Math.max(
              ...cells.map((cell, i) => cardHeight(cell) - todayHeights[i]),
            ),
          ),
        };
      });
      onDone(results);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 opacity-0"
      style={{ width: 420 }}
    >
      {ALL_CONCEPTS.map((concept) => (
        <div key={`stress-${concept.id}`} data-stress={concept.id}>
          <RealCard post={stressPost} slots={concept.slots} />
        </div>
      ))}
      {ALL_CONCEPTS.map((concept) =>
        realPosts.map((post) => (
          <div
            key={`${concept.id}-${post.id}`}
            data-fit={concept.id}
            data-title={post.title || post.sharedPost?.title}
          >
            <RealCard post={post} slots={concept.slots} />
          </div>
        )),
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

export const FitPage = (): ReactElement => {
  const [results, setResults] = useState<Result[]>();
  const columns = GAPS.map((gap) => ({ gap, ...narrowest(gap) }));

  return (
    <div className="relative min-h-screen bg-background-default px-8 py-10 text-text-primary">
      <h1 className="mb-2 font-bold typo-title1">Fit check</h1>
      <p className="mb-8 max-w-3xl text-pretty text-text-tertiary typo-callout">
        Does each bar fit the narrowest card each gap produces? Every variant is
        rendered on all 40 real posts and narrowed until its bar would overflow;
        the widest result is the width it needs. The narrowest card comes from
        the column switch points (3 to 6 columns, 40px margins), so it holds
        with the sidebar open or closed.
      </p>
      {!results && (
        <>
          <p className="text-text-tertiary typo-callout">
            Measuring {ALL_CONCEPTS.length * realPosts.length} cards…
          </p>
          <Measure onDone={setResults} />
        </>
      )}
      {results && (
        <table className="w-full max-w-5xl text-left typo-callout">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary">
              <th className="py-2 pr-4">Variant</th>
              <th className="py-2 pr-4">Needs (widest real post)</th>
              <th className="py-2 pr-4">Needs (stress counts)</th>
              <th className="py-2 pr-4">Card height vs today</th>
              {columns.map((c) => (
                <th key={c.gap} className="py-2 pr-4">
                  <span
                    className={classNames(
                      c.gap === GEOMETRY.gap && 'text-accent-ketchup-default',
                    )}
                  >
                    Gap {c.gap}
                    {c.gap === GEOMETRY.gap ? ' · today' : ''}
                  </span>
                  <span className="block font-normal text-text-tertiary tabular-nums typo-caption1">
                    narrowest card {Math.floor(c.width * 10) / 10}px ({c.n}{' '}
                    columns)
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const concept = ALL_CONCEPTS.find((c) => c.id === r.id);
              return (
                <tr
                  key={r.id}
                  className="border-b border-border-subtlest-tertiary align-top"
                >
                  <td className="py-3 pr-4 font-bold">{concept?.name}</td>
                  <td className="py-3 pr-4 tabular-nums">
                    {r.worst}px
                    <span className="block text-text-tertiary typo-caption1">
                      median {r.median}px · widest: “{r.worstTitle.slice(0, 40)}
                      ”
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{r.stress}px</td>
                  <td
                    className={classNames(
                      'py-3 pr-4 font-bold tabular-nums',
                      r.taller > 0
                        ? 'text-accent-ketchup-default'
                        : 'text-accent-avocado-default',
                    )}
                  >
                    {r.taller > 0 ? `+${r.taller}px taller` : 'Same height'}
                  </td>
                  {columns.map((c) => {
                    const spare = Math.floor(c.width - r.worst);
                    const stressSpare = Math.floor(c.width - r.stress);
                    return (
                      <td key={c.gap} className="py-3 pr-4 tabular-nums">
                        <span
                          className={classNames(
                            'block font-bold',
                            spare >= 0
                              ? 'text-accent-avocado-default'
                              : 'text-accent-ketchup-default',
                          )}
                        >
                          {spare >= 0
                            ? `Fits · ${spare}px spare`
                            : `Overflows ${-spare}px`}
                        </span>
                        <span
                          className={classNames(
                            'block typo-caption1',
                            stressSpare >= 0
                              ? 'text-text-tertiary'
                              : 'text-accent-ketchup-default',
                          )}
                        >
                          stress:{' '}
                          {stressSpare >= 0
                            ? `fits · ${stressSpare}px`
                            : `overflows ${-stressSpare}px`}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
