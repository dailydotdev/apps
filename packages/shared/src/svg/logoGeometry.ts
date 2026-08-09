/**
 * The daily.dev mark as geometry, so there is one copy of it.
 *
 * `LogoIcon` draws it and the agent's thinking indicator samples it for points,
 * and those two used to hold the same path strings independently — a logo tweak
 * would have left the indicator drawing the old shape with nothing failing.
 *
 * Kept free of anything but data: the logo renders on every screen in the app,
 * and the sampling code that also reads this has a canvas in it.
 */
export const MARK_WIDTH = 35;
export const MARK_HEIGHT = 20;
export const MARK_VIEWBOX = `0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`;

export const leftChevron =
  'M16.28 6.18864L13.4275 9.04718L9.62342 5.23514L4.86849 10L8.67256 13.8121L6.77152 17.6228L0.590647 11.429C-0.196882 10.6398 -0.196882 9.36026 0.590647 8.57108L8.1978 0.948006C8.98533 0.158828 10.2625 0.158497 11.05 0.947675L16.28 6.18864Z';
export const slash =
  'M23.4118 0.947675C24.1993 0.158497 25.4765 0.158828 26.264 0.948006L27.6903 2.37727L11.05 19.0524C10.2625 19.8415 8.98533 19.8412 8.1978 19.052L6.77152 17.6228L23.4118 0.947675Z';
export const rightTail =
  'M29.5925 9.99823L25.7884 6.1862L27.6895 2.37549L33.8703 8.5693C34.6579 9.35848 34.6579 10.638 33.8703 11.4272L26.2629 19.0506C25.4753 19.8398 24.1985 19.8398 23.411 19.0506C22.6234 18.2614 22.6234 16.9819 23.411 16.1927L29.5925 9.99823Z';

/**
 * The three strokes, and the alpha each is drawn at. The tail is the lighter
 * one; the indicator keeps that reading when it flies the mark apart.
 */
export const markPaths = [leftChevron, slash, rightTail];
export const markAlphas = [1, 1, 0.64];
