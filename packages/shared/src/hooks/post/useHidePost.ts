import { useCallback, useContext, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import useReportPost from '../useReportPost';
import { useBlockPostPanel } from './useBlockPostPanel';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { usePostLogEvent } from '../../lib/feed';

interface UseHidePostProps {
  post: Post;
  origin?: Origin;
}

interface UseHidePost {
  onHide: (overrideOrigin?: Origin) => Promise<boolean>;
  onUnhide: () => Promise<void>;
  onConfirmDismiss: (reason?: 'done' | 'unfollow' | 'block' | 'report') => void;
}

export const useHidePost = ({
  post,
  origin = Origin.PostContextMenu,
}: UseHidePostProps): UseHidePost => {
  const { hidePost, unhidePost } = useReportPost();
  const { onShowPanel, onClose } = useBlockPostPanel(post);
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { items, onRemovePost, logOpts } = useContext(ActiveFeedContext);

  const postIndex = useMemo(
    () =>
      items.findIndex(
        (item) => item.type === 'post' && item.post.id === post.id,
      ),
    [items, post.id],
  );

  const onHide = useCallback(
    async (overrideOrigin?: Origin) => {
      const { successful } = await hidePost(post.id);

      if (!successful) {
        return false;
      }

      logEvent(
        postLogEvent(LogEvent.HidePost, post, {
          extra: { origin: overrideOrigin ?? origin },
          ...logOpts,
        }),
      );

      onShowPanel({ mode: 'hide' });
      return true;
    },
    [hidePost, post, logEvent, postLogEvent, origin, logOpts, onShowPanel],
  );

  const onUnhide = useCallback(async () => {
    logEvent(
      postLogEvent(LogEvent.HidePostUndo, post, {
        ...logOpts,
      }),
    );
    await unhidePost(post.id);
    onClose(true);
  }, [unhidePost, post, onClose, logEvent, postLogEvent, logOpts]);

  const onConfirmDismiss = useCallback(
    (reason: 'done' | 'unfollow' | 'block' | 'report' = 'done') => {
      const eventByReason: Record<typeof reason, LogEvent> = {
        done: LogEvent.HidePostConfirm,
        unfollow: LogEvent.HidePostUnfollowSource,
        block: LogEvent.HidePostBlockTags,
        report: LogEvent.HidePostReport,
      };

      logEvent(
        postLogEvent(eventByReason[reason], post, {
          ...logOpts,
        }),
      );

      onClose(true);
      if (postIndex >= 0) {
        onRemovePost?.(postIndex);
      }
    },
    [onClose, onRemovePost, postIndex, logEvent, postLogEvent, post, logOpts],
  );

  return { onHide, onUnhide, onConfirmDismiss };
};
