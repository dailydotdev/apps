const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * ISO 8601 week number (1-53) of a YYYY-MM-DD date, computed in UTC so it
 * never shifts with the viewer's timezone.
 */
export const getIsoWeekNumber = (date: string): number => {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, day));
  // The week belongs to the year of its Thursday.
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = Date.UTC(target.getUTCFullYear(), 0, 1);

  return Math.ceil(((target.getTime() - yearStart) / DAY_MS + 1) / 7);
};

/** This ISO week's Monday as YYYY-MM-DD in UTC, the way the API keys picks. */
export const getCurrentWeekStart = (now: Date = new Date()): string => {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const daysSinceMonday = (new Date(today).getUTCDay() + 6) % 7;

  return new Date(today - daysSinceMonday * DAY_MS).toISOString().slice(0, 10);
};

/**
 * Distinct posts of the week below which there is nothing worth nudging
 * about. The same bar the Friday notification uses.
 */
export const PICKS_HERO_MIN_SIGNALS = 3;

/**
 * Thursday to Sunday in the viewer's own time: late enough in the week to
 * have read something, early enough to publish before it ends.
 */
export const isPicksNudgeDay = (now: Date = new Date()): boolean => {
  const day = now.getDay();

  return day === 0 || day >= 4;
};

/** Campaign id on post links from a picks page, so clicks can be attributed. */
export const PICKS_CAMPAIGN_ID = 'share_picks';

/** Accounts younger than this count as new viewers in picks analytics. */
export const PICKS_NEW_USER_DAYS = 7;

/**
 * Post link with the author and the campaign attached, so post sharing
 * attribution and click analytics both work.
 */
export const getPickPostHref = (
  commentsPermalink: string,
  authorId: string,
): string => {
  try {
    const url = new URL(commentsPermalink);
    url.searchParams.set('userid', authorId);
    url.searchParams.set('cid', PICKS_CAMPAIGN_ID);

    return url.toString();
  } catch {
    return commentsPermalink;
  }
};

/** Whether the account was created within the last week. */
export const isNewPicksViewer = (
  createdAt?: string | null,
  now: Date = new Date(),
): boolean => {
  if (!createdAt) {
    return false;
  }
  const created = new Date(createdAt).getTime();

  return (
    !Number.isNaN(created) &&
    now.getTime() - created < PICKS_NEW_USER_DAYS * DAY_MS
  );
};
