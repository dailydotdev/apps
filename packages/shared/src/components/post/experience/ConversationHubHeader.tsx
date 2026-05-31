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
    <section className="shadow-1 mt-8 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-6">
      <p className="font-bold text-text-primary typo-title2">
        What developers are saying
      </p>
      <p className="mt-2 max-w-2xl text-text-tertiary typo-callout">
        {user
          ? `Add your take, compare notes, and help shape the conversation around ${topicLabel}.`
          : `Read the discussion freely. Join when you are ready to add your take on ${topicLabel}.`}
      </p>
    </section>
  );
};
