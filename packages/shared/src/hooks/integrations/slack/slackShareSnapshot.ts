import { del as delCache, get as getCache, set as setCache } from 'idb-keyval';
import type { SlackChannel } from '../../../graphql/integrations';

/**
 * A snapshot sent to Slack in place of the post link, plus what the picker
 * held when it left for Slack's OAuth, so the return can put it all back.
 */
export type SlackShareSnapshot = {
  image: Blob;
  filename: string;
  message?: string;
  channel?: SlackChannel;
};

type StoredSlackShareSnapshot = SlackShareSnapshot & { id: string };

export const slackShareSnapshotKey = 'slack_share_snapshot';

export const clearSlackShareSnapshot = async (): Promise<void> => {
  try {
    await delCache(slackShareSnapshotKey);
  } catch {
    // nothing to clear
  }
};

// OAuth is a full page load, so the snapshot waits in IndexedDB for the return.
// A failed write only means the return asks for a new snapshot.
export const saveSlackShareSnapshot = async (
  id: string,
  snapshot: SlackShareSnapshot,
): Promise<void> => {
  try {
    await delCache(slackShareSnapshotKey);
    const stored: StoredSlackShareSnapshot = { ...snapshot, id };
    await setCache(slackShareSnapshotKey, stored);
  } catch {
    // the return finds nothing and says so
  }
};

/** The snapshot saved for this attempt. Whatever was stored is cleared. */
export const takeSlackShareSnapshot = async (
  id: string,
): Promise<SlackShareSnapshot | undefined> => {
  try {
    const stored = await getCache<StoredSlackShareSnapshot>(
      slackShareSnapshotKey,
    );
    await delCache(slackShareSnapshotKey);

    if (stored?.id !== id) {
      return undefined;
    }

    const { id: storedId, ...snapshot } = stored;

    return snapshot;
  } catch {
    return undefined;
  }
};
