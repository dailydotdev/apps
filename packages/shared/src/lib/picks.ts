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

/** Post link with the author attached, so post sharing attribution works. */
export const getPickPostHref = (
  commentsPermalink: string,
  authorId: string,
): string => {
  try {
    const url = new URL(commentsPermalink);
    url.searchParams.set('userid', authorId);

    return url.toString();
  } catch {
    return commentsPermalink;
  }
};
