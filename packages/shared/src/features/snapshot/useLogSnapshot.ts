import { useCallback } from 'react';
import type { Post } from '../../graphql/posts';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

/**
 * A snapshot is a share of the post, so it lands on the same `SharePost` event
 * every link copy on the page uses: provider `snapshot`, the placement as the
 * origin, and how the press ended. Adoption, per-placement usage and the
 * clipboard-versus-download split all come out of that one event.
 */
export function useLogSnapshot(
  post: Post,
  origin: Origin,
): (result: SnapshotResult) => void {
  const { logEvent } = useLogContext();

  return useCallback(
    (result: SnapshotResult) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider: ShareProvider.Snapshot, origin, result },
        }),
      ),
    [logEvent, origin, post],
  );
}
