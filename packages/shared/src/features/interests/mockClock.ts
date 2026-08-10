const anHour = 1000 * 60 * 60;

// Floored to the hour so server and client agree and relative times do not
// hydrate as a mismatch. A fixed date would too, but goes stale ("5mo ago").
export const mockNow = (): number => Math.floor(Date.now() / anHour) * anHour;

export const minutesAgo = (minutes: number): string =>
  new Date(mockNow() - 1000 * 60 * minutes).toISOString();

export const hoursAgo = (hours: number): string => minutesAgo(hours * 60);

export const daysAgo = (days: number): string => hoursAgo(days * 24);
