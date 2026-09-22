import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  featurePostSignupWidget,
  featurePostTopicSignup,
} from '../../lib/featureManagement';
import { AuthTriggers } from '../../lib/auth';
import { SignupWidget } from '../auth/SignupWidget';
import type { Post } from '../../graphql/posts';
import { PostTopicSignup } from './PostTopicSignup';

interface PostSignupWidgetProps {
  post: Post;
  inline?: boolean;
  className?: string;
}

export function PostSignupWidget({
  post,
  inline = false,
  className,
}: PostSignupWidgetProps): ReactElement | null {
  const { user, isAuthReady } = useAuthContext();
  const article = post.sharedPost ?? post;
  const tag = article.tags?.find((value) => value.trim().length > 0);
  const shouldEvaluate = isAuthReady && !user;
  const { value: isTopicEnabled } = useConditionalFeature({
    feature: featurePostTopicSignup,
    shouldEvaluate: shouldEvaluate && !!tag,
  });
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePostSignupWidget,
    shouldEvaluate: shouldEvaluate && !inline && !isTopicEnabled,
  });

  if (!shouldEvaluate) {
    return null;
  }

  if (isTopicEnabled && tag) {
    return inline ? (
      <PostTopicSignup
        key={`${article.id}:${tag}`}
        post={article}
        tag={tag}
        className={className}
      />
    ) : null;
  }

  if (inline || !isEnabled) {
    return null;
  }

  return (
    <SignupWidget
      title="Want your personalized dev feed?"
      description="Millions of developers rely on daily.dev for tech news, tools, and discussions that actually matter."
      trigger={AuthTriggers.PostPage}
      className={className}
    />
  );
}
