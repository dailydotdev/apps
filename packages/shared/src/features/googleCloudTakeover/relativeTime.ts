// Timestamps for the demo are computed relative to load time so the takeover
// keeps looking fresh indefinitely (it's a long-lived sales demo that never
// merges, so fixed dates would slowly age into "5 months ago").

const HOUR_MS = 60 * 60 * 1000;

export const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * HOUR_MS).toISOString();

export const daysAgo = (days: number): string => hoursAgo(days * 24);
