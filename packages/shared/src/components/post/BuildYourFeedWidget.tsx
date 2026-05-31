import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useActivePostContext } from '../../contexts/ActivePostContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import AuthOptions from '../auth/AuthOptions';
import { AuthDisplay, type AuthProps } from '../auth/common';
import { WidgetContainer } from '../widgets/common';
import {
  getPostTopicLabel,
  getPostTopicTags,
  getPostTopicTargetId,
} from './anonymousPostExperience';
import { PostTopicChips } from './PostTopicChips';

export const BuildYourFeedWidget = (): ReactElement => {
  const activePost = useActivePostContext()?.activePost;
  const { showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const topics = getPostTopicTags(activePost);
  const topicLabel = getPostTopicLabel(topics);
  const targetId = getPostTopicTargetId(activePost);
  const extra = useMemo(
    () =>
      JSON.stringify({
        origin: Origin.ArticlePage,
        post_id: activePost?.id,
        surface: 'build_your_feed_widget',
        tags: activePost?.tags?.slice(0, topics.length) ?? [],
      }),
    [activePost?.id, activePost?.tags, topics.length],
  );

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_id: 'build_your_feed_widget',
    target_type: TargetType.ArticleAnonymousCTA,
    extra,
  }));

  const onAuthStateUpdate = useCallback(
    (props: Partial<AuthProps>) => {
      logEvent({
        event_name: LogEvent.ClickArticleAnonymousCTA,
        target_id: 'build_your_feed_widget',
        target_type: TargetType.ArticleAnonymousCTA,
        extra,
      });

      showLogin({
        trigger: AuthTriggers.PostPage,
        options: {
          isLogin: !!props.isLoginFlow,
          defaultDisplay: props.defaultDisplay,
          formValues: props.email ? { email: props.email } : undefined,
        },
      });
    },
    [extra, logEvent, showLogin],
  );

  return (
    <WidgetContainer
      className="flex flex-col gap-3 p-4"
      data-testid="buildYourFeedWidget"
    >
      <div className="flex flex-col gap-2">
        <p className="font-bold text-text-primary typo-title3">
          Get a feed for {topicLabel}
        </p>
        <p className="text-text-tertiary typo-footnote">
          Sign up to turn this post into a daily.dev feed tuned to your stack,
          interests, and the developers discussing them right now.
        </p>
      </div>
      <PostTopicChips topics={topics} />
      <AuthOptions
        compact
        defaultDisplay={AuthDisplay.OnboardingSignup}
        forceDefaultDisplay
        formRef={null as unknown as React.MutableRefObject<HTMLFormElement>}
        hideLoginLink
        ignoreMessages
        onAuthStateUpdate={onAuthStateUpdate}
        onboardingSignupButton={{
          size: ButtonSize.Medium,
          variant: ButtonVariant.Primary,
        }}
        simplified
        targetId={targetId}
        trigger={AuthTriggers.PostPage}
        className={{
          onboardingSignup: '!gap-3',
        }}
      />
    </WidgetContainer>
  );
};
