import type { ResponseError } from '../graphql/common';
import { ApiError } from '../graphql/common';
import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper } from './storageWrapper';
import { isSameDayInTimezone } from './timezones';

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

// Codes that mean the API will never count this view (the post is gone, the
// user cannot see it, or the session is not valid). Anything else, including
// other GraphQL errors such as rate limiting or a failed publish, is treated
// like a dropped connection and the view is kept for a retry.
// Read when called, not at module load: graphql/common sits in an import
// cycle with this file, so ApiError can still be undefined at load time.
const getFinalViewRejectionCodes = (): string[] => [
  ApiError.NotFound,
  ApiError.Forbidden,
  ApiError.Unauthenticated,
];

export const isFinalViewRejection = (error: unknown): boolean => {
  const errors = (error as Partial<ResponseError>)?.response?.errors;
  const finalCodes = getFinalViewRejectionCodes();

  return (
    Array.isArray(errors) &&
    errors.some((item) => finalCodes.includes(item?.extensions?.code as string))
  );
};

// viewPost takes no read time: the API credits a replayed view to the moment
// it arrives. Only a view from the same local day lands on the day it was
// read, so anything older is dropped instead of sent.
export const isStreakViewCreditable = (
  at: Date,
  now: Date,
  timezone?: string,
): boolean => isSameDayInTimezone(at, now, timezone);

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
    if (isFinalViewRejection(error)) {
      removeStreakView(view);
      return sendQueuedViews(rest, sendView, now, sent);
    }

    // still offline or a transient API error, keep the rest for the next drain
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
