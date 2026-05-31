import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useActivePostContext } from '../../contexts/ActivePostContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import {
  getPostTopicLabel,
  getPostTopicTags,
  getPostTopicTargetId,
} from '../post/anonymousPostExperience';
import { PostTopicChips } from '../post/PostTopicChips';
import { AuthenticationBanner } from './AuthenticationBanner';

interface PostTopicAuthBannerProps {
  compact?: boolean;
}

export const PostTopicAuthBanner = ({
  compact,
}: PostTopicAuthBannerProps): ReactElement => {
  const activePost = useActivePostContext()?.activePost;
  const { logEvent } = useLogContext();
  const topics = getPostTopicTags(activePost);
  const topicLabel = getPostTopicLabel(topics);
  const targetId = getPostTopicTargetId(activePost);
  const extra = useMemo(
    () =>
      JSON.stringify({
        origin: Origin.ArticlePage,
        post_id: activePost?.id,
        surface: 'post_topic_auth_banner',
        tags: activePost?.tags?.slice(0, topics.length) ?? [],
      }),
    [activePost?.id, activePost?.tags, topics.length],
  );

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_id: 'post_topic_auth_banner',
    target_type: TargetType.ArticleAnonymousCTA,
    extra,
  }));

  const onAuthStateUpdate = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickArticleAnonymousCTA,
      target_id: 'post_topic_auth_banner',
      target_type: TargetType.ArticleAnonymousCTA,
      extra,
    });
  }, [extra, logEvent]);

  return (
    <AuthenticationBanner
      compact={compact}
      onAuthStateUpdate={onAuthStateUpdate}
      targetId={targetId}
      trigger={AuthTriggers.PostPage}
    >
      <div className="flex flex-col gap-3">
        <p className="font-bold text-text-primary typo-large-title">
          Build a feed around {topicLabel}
        </p>
        <p className="text-text-secondary typo-body">
          daily.dev turns this post into a personalized stream of stories,
          discussions, and tools from developers who care about the same topics.
        </p>
        <PostTopicChips topics={topics} />
      </div>
    </AuthenticationBanner>
  );
};
