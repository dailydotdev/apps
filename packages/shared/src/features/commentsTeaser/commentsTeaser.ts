// The logged-out comment teaser, after X's logged-out post page: the first
// few comments, skeleton comments for the rest, and a pinned footer asking
// the reader in.

/** Top-level comments a logged-out reader sees. X shows three. */
export const COMMENTS_TEASER_LIMIT = 3;

/** X's minimum; more are added until the window below is full. */
export const COMMENTS_TEASER_MIN_SKELETONS = 2;

/**
 * The footer's title, X's rule word for word with daily.dev's noun: "See all
 * the replies" whenever the post has one, "Join the conversation" when it
 * has none. No count, like X and like every other footer title.
 */
export const getCommentsTeaserTitle = (numComments = 0): string =>
  numComments > 0 ? 'See all the comments' : 'Join the conversation';

// When the pinned footer arrives, X's rule (x.com's logged-out footer, read
// Oct 2026): not on load, but on the first of one full screen scrolled,
// being near the end, a page too short to scroll after 1.5s, or 5s.
export const REVEAL_FALLBACK_MS = 5000;
export const REVEAL_SHORT_PAGE_MS = 1500;
export const REVEAL_BOTTOM_PX = 168;
