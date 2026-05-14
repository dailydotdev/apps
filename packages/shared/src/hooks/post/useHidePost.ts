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

type DismissReason = 'dismiss' | 'unfollow' | 'block' | 'report';

interface UseHidePost {
  onHide: () => Promise<boolean>;
  onUnhide: () => Promise<void>;
  onConfirmDismiss: (reason?: DismissReason) => void;
}

const eventByReason: Record<DismissReason, LogEvent> = {
  dismiss: LogEvent.HidePostDismiss,
  unfollow: LogEvent.HidePostUnfollowSource,
  block: LogEvent.HidePostBlockTags,
  report: LogEvent.HidePostReport,
};

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

  const onHide = useCallback(async () => {
    const { successful } = await hidePost(post.id);

    if (!successful) {
      return false;
    }

    logEvent(
      postLogEvent(LogEvent.HidePost, post, {
        extra: { origin },
        ...logOpts,
      }),
    );

    onShowPanel({ mode: 'hide' });
    return true;
  }, [hidePost, post, logEvent, postLogEvent, origin, logOpts, onShowPanel]);

  const onUnhide = useCallback(async () => {
    const { successful } = await unhidePost(post.id);

    if (!successful) {
      return;
    }

    logEvent(
      postLogEvent(LogEvent.HidePostUndo, post, {
        ...logOpts,
      }),
    );
    onClose(true);
  }, [unhidePost, post, onClose, logEvent, postLogEvent, logOpts]);

  const onConfirmDismiss = useCallback(
    (reason: DismissReason = 'dismiss') => {
      logEvent(
        postLogEvent(eventByReason[reason], post, {
          ...logOpts,
        }),
      );

      onClose(true);
      // postIndex can be -1 when the panel is rendered outside of an
      // ActiveFeedContext (e.g. standalone post page) or when the post
      // was already removed by another flow. Closing the panel is enough
      // in those cases — no removal callback to invoke.
      if (postIndex >= 0) {
        onRemovePost?.(postIndex);
      }
    },
    [onClose, onRemovePost, postIndex, logEvent, postLogEvent, post, logOpts],
  );

  return { onHide, onUnhide, onConfirmDismiss };
};
