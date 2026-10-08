import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RealCard, realPosts } from './swap';
import { conceptById } from './concepts';
import { GAPS, narrowest, overflows } from './fit';
import { GEOMETRY } from './shell';

/** How much of each card's bottom to show: the end of the cover and the bar. */
const CROP = 210;

/** Two neighbouring cards at the narrowest width a gap gives, `gap` apart. */
const Pair = ({
  gap,
  width,
  conceptId,
}: {
  gap: number;
  width: number;
  conceptId: string;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState<boolean>();
  const { slots } = conceptById(conceptId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const cards = Array.from(
        ref.current?.querySelectorAll<HTMLElement>('[data-card]') ?? [],
      );
      setFits(cards.every((card) => !overflows(card)));
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div>
      <div
        ref={ref}
        className="flex items-end overflow-hidden"
        style={{ gap, height: CROP }}
      >
        {[realPosts[2], realPosts[0]].map((post) => (
          <div key={post.id} data-card="" style={{ width }}>
            <RealCard post={post} slots={slots} />
          </div>
        ))}
      </div>
      {fits !== undefined && (
        <p
          className={classNames(
            'mt-2 font-bold typo-caption1',
            fits
              ? 'text-accent-avocado-default'
              : 'text-accent-ketchup-default',
          )}
        >
          {fits ? 'Fits' : 'Overflows'}
        </p>
      )}
    </div>
  );
};

/**
 * The question "if we tighten the grid, does today's bar get room to grow?"
 * as one picture: each gap's narrowest cards with today's bar as it is, and
 * the same bar at 32px.
 */
export const GapSheet = (): ReactElement => (
  <div className="inline-block min-w-full bg-background-default px-10 py-10 text-text-primary">
    <h1 className="mb-1 font-bold typo-title2">
      Tighter grid gap → room for today’s bar at 32px
    </h1>
    <p className="mb-8 max-w-4xl text-text-tertiary typo-callout">
      Each row is one feed gap, at the narrowest card that gap produces in
      production (40px margins, 3–6 columns). Left: today’s bar unchanged (24px
      buttons, 16px icons). Right: the same bar — same order, colours and
      numbers — at 32px with 20px icons. Real posts; card height unchanged.
    </p>
    <div
      className="grid items-start gap-x-14 gap-y-8"
      style={{ gridTemplateColumns: 'max-content max-content max-content' }}
    >
      <span />
      <p className="font-bold text-text-secondary typo-callout">
        Today’s bar · 24px
      </p>
      <p className="font-bold text-text-secondary typo-callout">
        Same bar · 32px
      </p>
      {GAPS.map((gap) => {
        const { width, n } = narrowest(gap);
        return (
          <React.Fragment key={gap}>
            <div className="w-40 pt-2">
              <p
                className={classNames(
                  'font-bold typo-title3',
                  gap === GEOMETRY.gap && 'text-accent-ketchup-default',
                )}
              >
                Gap {gap}px
              </p>
              <p className="text-text-tertiary tabular-nums typo-footnote">
                {gap === GEOMETRY.gap ? 'today · ' : ''}cards{' '}
                {Math.floor(width * 10) / 10}px
                <br />
                narrowest, at {n} columns
              </p>
            </div>
            <Pair gap={gap} width={width} conceptId="today" />
            <Pair gap={gap} width={width} conceptId="today-32" />
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
