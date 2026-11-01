import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import { useFeedWidgetAdSlot } from './feedState';

/**
 * The rail's height: the feed's usual card, one with a three-line title,
 * so the rail lines up with the row below it. Feed cards run from
 * `min-h-card` to `max-h-cardLarge` with their content; most rows land here.
 */
export const RAIL_HEIGHT = '25.375rem';
/** Half the rail, less the row gap: a Small widget, or one row of a Tall one. */
export const RAIL_CELL_HEIGHT = `calc((${RAIL_HEIGHT} - 1.5rem) / 2)`;

/*
 * The rail's frame, shared by the rail and the skeleton that holds its place
 * while the rail's code loads and the phone check settles, so the two are the
 * same height to the pixel and nothing below the rail moves when it lands.
 */
// Below tablet the feed has no gutter (its cards run full-bleed), so the rail
// brings its own: the header and the first widget sit 1rem in from the edge.
// The scroller bleeds back out by exactly that inset, so widgets still swipe
// to the screen edge without the page itself growing sideways.
export const railSectionClassName =
  'group/rail relative flex flex-col gap-1 px-4 tablet:px-0';
export const railHeaderClassName = 'flex min-h-12 items-center gap-2';
export const railScrollerClassName =
  'no-scrollbar -mx-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-4 px-4 pb-3 pt-4 tablet:-mx-2 tablet:scroll-px-2 tablet:px-2';

// One row gap on every screen: the rail's height never depends on the phone
// check, which reads "not a phone" for a frame before it settles.
export const railGridClassName = (isPhone: boolean): string =>
  classNames('relative grid gap-y-6', isPhone ? 'gap-x-3' : 'gap-x-6');

export const railGridStyle = (
  columns: number,
  isPhone: boolean,
): CSSProperties => ({
  gridTemplateRows: `repeat(2, ${RAIL_CELL_HEIGHT})`,
  // A phone shows one column and the edge of the next, so the rail always
  // says it scrolls.
  gridAutoColumns: isPhone
    ? 'calc((100% - 0.75rem) / 1.18)'
    : `calc((100% - ${(columns - 1) * 1.5}rem) / ${columns})`,
});

/** The rail's shape with nothing in it yet. */
export const FeedWidgetRailSkeleton = ({
  columns = 4,
  isPhone = false,
}: {
  columns?: number;
  isPhone?: boolean;
}): ReactElement => (
  <section className={railSectionClassName} aria-busy aria-label="Your widgets">
    <div className={railHeaderClassName}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <ElementPlaceholder className="h-5 w-48 rounded-8" />
        <ElementPlaceholder className="h-4 w-32 rounded-8" />
      </div>
    </div>
    <div className={railScrollerClassName}>
      <div
        className={railGridClassName(isPhone)}
        style={railGridStyle(columns, isPhone)}
      >
        {Array.from({ length: Math.max(1, Math.min(columns, 4)) }, (_, i) => (
          <ElementPlaceholder
            // A fixed number of placeholder columns; their order never changes.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="rounded-16"
            style={{ gridRow: '1 / span 2' }}
          />
        ))}
      </div>
    </div>
  </section>
);

/** The skeleton in the shape the rail will take on this screen. */
export const FeedWidgetRailLoading = (): ReactElement => {
  const { columns, isPhone } = useFeedWidgetAdSlot();

  return <FeedWidgetRailSkeleton columns={columns} isPhone={isPhone} />;
};
