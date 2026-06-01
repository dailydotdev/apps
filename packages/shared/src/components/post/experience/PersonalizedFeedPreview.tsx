import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import FurtherReading from '../../widgets/FurtherReading';
import { PostTopicChips } from '../PostTopicChips';
import {
  getPostTopicLabel,
  getPostTopicTags,
} from '../anonymousPostExperience';

interface PersonalizedFeedPreviewProps {
  post: Post;
}

export const PersonalizedFeedPreview = ({
  post,
}: PersonalizedFeedPreviewProps): ReactElement => {
  const { user } = useAuthContext();
  const topics = getPostTopicTags(post);
  const topicLabel = getPostTopicLabel(topics);

  return (
    <section
      className="overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle"
      data-testid="personalized-feed-preview"
    >
      <div className="border-b border-border-subtlest-tertiary p-4 tablet:p-5">
        <p className="text-text-tertiary typo-caption1">Keep reading</p>
        <h2 className="mt-1 font-bold text-text-primary typo-title2">
          More stories after the discussion
        </h2>
        <p className="mt-1 text-text-tertiary typo-callout">
          If this topic matters to you, daily.dev can keep the useful follow-up
          stories flowing around {topicLabel}.
        </p>
        <PostTopicChips className="mt-3" topics={topics} />
      </div>
      <FurtherReading className="p-3 tablet:p-4" currentPost={post} />
      <div className="border-t border-border-subtlest-tertiary p-4 text-text-secondary typo-footnote">
        {user
          ? 'Use these signals to tune your feed and keep surfacing better developer context.'
          : 'Sign up to turn this preview into a personalized feed that follows your stack.'}
      </div>
    </section>
  );
};
