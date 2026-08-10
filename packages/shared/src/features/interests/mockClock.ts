const anHour = 1000 * 60 * 60;

/**
 * The instant every mock timestamp is measured from.
 *
 * Rounded down to the top of the hour, and that is the whole point. The mocks
 * used to measure from `Date.now()`, so the server built one set of timestamps
 * and the browser built another a few seconds later — and every relative time in
 * the tree hydrated as a mismatch: "7m" against a "7m" taken from a different
 * instant.
 *
 * Rounding makes the two agree without freezing the data at a fixed date, which
 * is the other way out and a worse one: a design surface that says "5mo ago"
 * because the mock was written in August is no use to anyone. The only remaining
 * window is a page that renders on one side of an hour boundary and hydrates on
 * the other, which resolves itself on the next load.
 */
export const mockNow = (): number => Math.floor(Date.now() / anHour) * anHour;

export const minutesAgo = (minutes: number): string =>
  new Date(mockNow() - 1000 * 60 * minutes).toISOString();

export const hoursAgo = (hours: number): string => minutesAgo(hours * 60);

export const daysAgo = (days: number): string => hoursAgo(days * 24);
