import { subHours } from 'date-fns';
import type { ResponseError } from '../graphql/common';
import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper } from './storageWrapper';
import { dateFormatInTimezone, isSameDayInTimezone } from './timezones';

export interface QueuedStreakView {
  postId: string;
  userId: string;
  at: number;
  timezone?: string;
}

export const STREAK_VIEW_QUEUE_KEY = generateStorageKey(
  StorageTopic.Streak,
  'pendingViews',
);

// Reads in the first hours of the next local day still credit the previous
// streak day on the API, so a queued view stays worth sending that long.
export const STREAK_VIEW_GRACE_HOURS = 3;

export const readStreakViewQueue = (): QueuedStreakView[] => {
  try {
    const raw = storageWrapper.getItem(STREAK_VIEW_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is QueuedStreakView =>
        !!item &&
        typeof item.postId === 'string' &&
        typeof item.userId === 'string' &&
        typeof item.at === 'number',
    );
  } catch {
    return [];
  }
};

const writeStreakViewQueue = (queue: QueuedStreakView[]): void => {
  try {
    if (queue.length) {
      storageWrapper.setItem(STREAK_VIEW_QUEUE_KEY, JSON.stringify(queue));
    } else {
      storageWrapper.removeItem(STREAK_VIEW_QUEUE_KEY);
    }
  } catch {
    // ignore storage quota / privacy-mode failures
  }
};

const isSameView = (a: QueuedStreakView, b: Pick<QueuedStreakView, 'postId'>) =>
  a.postId === b.postId;

export const enqueueStreakView = (view: QueuedStreakView): void => {
  const queue = readStreakViewQueue();

  if (queue.some((item) => isSameView(item, view))) {
    return;
  }

  writeStreakViewQueue([...queue, view]);
};

export const removeStreakView = (
  view: Pick<QueuedStreakView, 'postId'>,
): void => {
  writeStreakViewQueue(
    readStreakViewQueue().filter((item) => !isSameView(item, view)),
  );
};

export const isGraphQLRejection = (error: unknown): boolean =>
  Array.isArray((error as Partial<ResponseError>)?.response?.errors);

export const isStreakViewCreditable = (
  at: Date,
  now: Date,
  timezone?: string,
): boolean => {
  if (isSameDayInTimezone(at, now, timezone)) {
    return true;
  }

  const hour = parseInt(dateFormatInTimezone(now, 'HH', timezone), 10);

  if (Number.isNaN(hour) || hour >= STREAK_VIEW_GRACE_HOURS) {
    return false;
  }

  // Inside the grace window `now` is within a few hours of local midnight, so
  // twelve hours back lands on the previous local day whatever DST does.
  return isSameDayInTimezone(at, subHours(now, 12), timezone);
};

interface DrainStreakViewQueueProps {
  userId: string;
  sendView: (postId: string) => Promise<unknown>;
  now?: Date;
}

const sendQueuedViews = async (
  views: QueuedStreakView[],
  sendView: DrainStreakViewQueueProps['sendView'],
  now: Date,
  sent = 0,
): Promise<number> => {
  if (!views.length) {
    return sent;
  }

  const [view, ...rest] = views;

  if (!isStreakViewCreditable(new Date(view.at), now, view.timezone)) {
    removeStreakView(view);
    return sendQueuedViews(rest, sendView, now, sent);
  }

  try {
    await sendView(view.postId);
  } catch (error) {
    if (isGraphQLRejection(error)) {
      removeStreakView(view);
      return sendQueuedViews(rest, sendView, now, sent);
    }

    // still offline, keep the rest for the next drain
    return sent;
  }

  removeStreakView(view);
  return sendQueuedViews(rest, sendView, now, sent + 1);
};

// Replays the views queued for this user, oldest first, and resolves with how
// many the API accepted.
export const drainStreakViewQueue = ({
  userId,
  sendView,
  now = new Date(),
}: DrainStreakViewQueueProps): Promise<number> =>
  sendQueuedViews(
    readStreakViewQueue().filter((view) => view.userId === userId),
    sendView,
    now,
  );
