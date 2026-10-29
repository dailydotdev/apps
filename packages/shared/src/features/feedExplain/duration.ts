import { FeedControlDuration } from './types';

const dayMs = 86_400_000;

export const durationDays: Record<FeedControlDuration, number> = {
  [FeedControlDuration.ThreeDays]: 3,
  [FeedControlDuration.Week]: 7,
};

/** No duration lasts until the reader changes it, and is free. */
export const durationOptions: {
  value: FeedControlDuration | undefined;
  label: string;
}[] = [
  { value: undefined, label: 'Until I change it' },
  { value: FeedControlDuration.ThreeDays, label: '3 days' },
  { value: FeedControlDuration.Week, label: '1 week' },
];

// The API sets the real one; this is for the change shown before it answers.
export const getExpiresAt = (
  duration: FeedControlDuration | undefined,
  now = Date.now(),
): string | null =>
  duration ? new Date(now + durationDays[duration] * dayMs).toISOString() : null;

/** "until Sun", or "until Thu, Oct 22" when the weekday alone is ambiguous. */
export const formatUntil = (expiresAt: string, now = Date.now()): string => {
  const until = new Date(expiresAt);
  const weekday = until.toLocaleDateString('en-US', { weekday: 'short' });
  return until.getTime() - now < 6 * dayMs
    ? `until ${weekday}`
    : `until ${weekday}, ${until.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;
};
