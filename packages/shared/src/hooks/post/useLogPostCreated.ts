import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

interface LogPostCreatedParams {
  moderationCount?: number;
  postId?: string;
  postType?: string;
  sourceCount?: number;
  targetType?: string;
}

export const useLogPostCreated = (): ((
  params?: LogPostCreatedParams,
) => void) => {
  const { logEvent } = useLogContext();

  return useCallback(
    ({
      moderationCount,
      postId,
      postType,
      sourceCount,
      targetType,
    }: LogPostCreatedParams = {}) => {
      const extra = {
        ...(postType ? { post_type: postType } : {}),
        ...(sourceCount != null ? { source_count: sourceCount } : {}),
        ...(moderationCount != null
          ? { moderation_count: moderationCount }
          : {}),
      };

      logEvent({
        event_name: LogEvent.CreatePost,
        target_id: postId,
        target_type: targetType,
        extra: Object.keys(extra).length ? JSON.stringify(extra) : undefined,
      });
    },
    [logEvent],
  );
};
