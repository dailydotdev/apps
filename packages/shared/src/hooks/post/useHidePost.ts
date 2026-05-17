import { useCallback, useContext, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import type { Source } from '../../graphql/sources';
import useReportPost from '../useReportPost';
import { useBlockPostPanel } from './useBlockPostPanel';
import useTagAndSource from '../useTagAndSource';
import { useCustomFeed } from '../feed/useCustomFeed';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useLogContext } from '../../contexts/LogContext';
import { ToastSubject, useToastNotification } from '../useToastNotification';
import { LogEvent, Origin } from '../../lib/log';
import { usePostLogEvent } from '../../lib/feed';
import { labels } from '../../lib/labels';

interface UseHidePostProps {
  post: Post;
  origin?: Origin;
}

export interface HideFeedbackPayload {
  tags: string[];
  blockSource: boolean;
}

interface SubmitFeedbackResult {
  removed: boolean;
}

interface UseHidePost {
  onHide: () => Promise<boolean>;
  onUnhide: () => Promise<void>;
  onSubmitFeedback: (
    payload: HideFeedbackPayload,
  ) => Promise<SubmitFeedbackResult>;
  onUndoFeedback: (payload: HideFeedbackPayload) => Promise<void>;
  onDismiss: () => void;
  onReportSubmitted: () => void;
}

const buildFeedbackMessage = (
  { tags, blockSource }: HideFeedbackPayload,
  source?: Source,
): string => {
  const sourceName = source?.name ?? 'this source';
  const tagCount = tags.length;

  if (blockSource && tagCount > 0) {
    return tagCount === 1
      ? `Unfollowed ${sourceName} and blocked #${tags[0]}`
      : `Unfollowed ${sourceName} and blocked ${tagCount} tags`;
  }

  if (blockSource) {
    return `You won't see posts from ${sourceName} anymore`;
  }

  if (tagCount === 1) {
    return `Blocked #${tags[0]}`;
  }

  return `Blocked ${tagCount} tags`;
};

export const useHidePost = ({
  post,
  origin = Origin.PostContextMenu,
}: UseHidePostProps): UseHidePost => {
  const { hidePost, unhidePost } = useReportPost();
  const { onShowPanel, onClose } = useBlockPostPanel(post);
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { displayToast } = useToastNotification();
  const { items, onRemovePost, logOpts } = useContext(ActiveFeedContext);
  const { feedId: customFeedId } = useCustomFeed();
  const { onBlockTags, onUnblockTags, onBlockSource, onUnblockSource } =
    useTagAndSource({
      origin,
      postId: post.id,
      shouldInvalidateQueries: false,
      feedId: customFeedId,
    });

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

  const onUndoFeedback = useCallback(
    async ({ tags, blockSource }: HideFeedbackPayload) => {
      const { successful } = await unhidePost(post.id);

      if (!successful) {
        return;
      }

      await Promise.all([
        tags.length
          ? onUnblockTags({ tags })
          : Promise.resolve({ successful: true }),
        blockSource && post.source
          ? onUnblockSource({ source: post.source })
          : Promise.resolve({ successful: true }),
      ]);

      logEvent(
        postLogEvent(LogEvent.HidePostUndo, post, {
          ...logOpts,
        }),
      );
      onClose(true);
    },
    [
      unhidePost,
      onUnblockTags,
      onUnblockSource,
      post,
      logEvent,
      postLogEvent,
      logOpts,
      onClose,
    ],
  );

  const onSubmitFeedback = useCallback(
    async ({ tags, blockSource }: HideFeedbackPayload) => {
      await Promise.all([
        tags.length
          ? onBlockTags({ tags, requireLogin: true })
          : Promise.resolve({ successful: true }),
        blockSource && post.source
          ? onBlockSource({ source: post.source, requireLogin: true })
          : Promise.resolve({ successful: true }),
      ]);

      logEvent(
        postLogEvent(LogEvent.HidePostFeedbackSubmit, post, {
          extra: { blockedSource: blockSource, tagCount: tags.length, origin },
          ...logOpts,
        }),
      );

      const removed = postIndex >= 0;

      // Remove from the feed BEFORE clearing the panel state so the original
      // card never re-renders in place (avoids the "card flickers back" bug).
      if (removed) {
        onRemovePost?.(postIndex);
        onClose(true);
      }

      const showToast = blockSource || tags.length > 0;
      if (showToast) {
        displayToast(buildFeedbackMessage({ tags, blockSource }, post.source), {
          subject: ToastSubject.Feed,
          persistent: true,
          action: {
            copy: 'Undo',
            onClick: () => onUndoFeedback({ tags, blockSource }),
          },
        });
      }

      return { removed };
    },
    [
      onBlockTags,
      onBlockSource,
      post,
      logEvent,
      postLogEvent,
      logOpts,
      origin,
      postIndex,
      onRemovePost,
      onClose,
      displayToast,
      onUndoFeedback,
    ],
  );

  const onDismiss = useCallback(() => {
    logEvent(
      postLogEvent(LogEvent.HidePostDismiss, post, {
        ...logOpts,
      }),
    );
    if (postIndex >= 0) {
      onRemovePost?.(postIndex);
    }
    onClose(true);
  }, [logEvent, postLogEvent, post, logOpts, postIndex, onRemovePost, onClose]);

  const onReportSubmitted = useCallback(() => {
    logEvent(
      postLogEvent(LogEvent.HidePostReport, post, {
        ...logOpts,
      }),
    );
    if (postIndex >= 0) {
      onRemovePost?.(postIndex);
    }
    onClose(true);
    displayToast(labels.reporting.reportFeedbackText, {
      subject: ToastSubject.Feed,
    });
  }, [
    logEvent,
    postLogEvent,
    post,
    logOpts,
    postIndex,
    onRemovePost,
    onClose,
    displayToast,
  ]);

  return {
    onHide,
    onUnhide,
    onSubmitFeedback,
    onUndoFeedback,
    onDismiss,
    onReportSubmitted,
  };
};
