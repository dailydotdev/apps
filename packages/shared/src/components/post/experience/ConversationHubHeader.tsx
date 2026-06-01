import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  getPostTopicLabel,
  getPostTopicTags,
} from '../anonymousPostExperience';

interface ConversationHubHeaderProps {
  post: Post;
}

export const ConversationHubHeader = ({
  post,
}: ConversationHubHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const topicLabel = getPostTopicLabel(getPostTopicTags(post, 2));

  return (
    <section className="border-accent-blueCheese-default/30 shadow-1 rounded-24 border bg-action-comment-float p-4 tablet:p-6">
      <p className="text-action-comment-default typo-caption1">
        Community discussion
      </p>
      <h2 className="mt-1 font-bold text-text-primary typo-title1">
        What developers are saying
      </h2>
      <p className="mt-2 max-w-2xl text-text-secondary typo-callout">
        {user
          ? `Add your take, compare notes, and help shape the conversation around ${topicLabel}.`
          : `Read the discussion freely. Join when you are ready to add your take on ${topicLabel}.`}
      </p>
      <p className="mt-3 text-text-tertiary typo-footnote">
        {post.numComments ?? 0} comments · {post.numUpvotes ?? 0} developer
        upvotes
      </p>
    </section>
  );
};
