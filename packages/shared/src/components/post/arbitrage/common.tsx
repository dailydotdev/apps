import classed from '../../../lib/classed';

/**
 * Same two-column shell the classic post layout uses, without the fixed
 * navigation branch — this template never enters modal/navigation mode.
 */
export const PostContentContainerRaw = classed(
  'div',
  'm-auto flex w-full flex-col bg-background-default pb-6 laptop:flex-row laptop:border-x laptop:border-border-subtlest-tertiary',
);

/**
 * The article column's viewport geometry, published on the document so the
 * floating leaderboard can sit exactly where the top one does. The anchor is
 * `position: fixed`, so it is measured against the viewport and has no other
 * way to know the column is inset by the sidebar.
 *
 * Both read with a fallback, so an anchor on a page that never publishes them
 * still spans the viewport as it did before.
 */
export const COLUMN_LEFT_PROPERTY = '--arbitrage-column-left';
export const COLUMN_WIDTH_PROPERTY = '--arbitrage-column-width';

/** The article column's own padding, mirrored by anything aligning to it. */
export const COLUMN_PADDING = 'px-4 tablet:px-6 laptop:px-8';
