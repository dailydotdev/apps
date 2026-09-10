import { useCallback } from 'react';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { useLogContext } from '../../contexts/LogContext';
import type { PostHighlight } from '../../graphql/highlights';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetType } from '../../lib/log';
import type { ShareProvider } from '../../lib/share';

/**
 * A highlight points at a post, so sharing one is a `SharePost` on that post
 * with the highlight id beside it, in the same shape as the post page's
 * placements. Without a highlight the link is the Happening Now page itself,
 * which has no post to target.
 */
export function useLogHighlightShare(
  origin: Origin,
  highlight?: Pick<PostHighlight, 'id' | 'post'>,
): (provider: ShareProvider, result?: SnapshotResult) => void {
  const { logEvent } = useLogContext();
  const highlightId = highlight?.id;
  const postId = highlight?.post.id;

  return useCallback(
    (provider: ShareProvider, result?: SnapshotResult) =>
      logEvent({
        event_name: postId ? LogEvent.SharePost : LogEvent.ShareHighlights,
        ...(postId && { target_id: postId, target_type: TargetType.Post }),
        extra: JSON.stringify({
          provider,
          origin,
          ...(result && { result }),
          ...(highlightId && { highlight_id: highlightId }),
        }),
      }),
    [highlightId, logEvent, origin, postId],
  );
}
