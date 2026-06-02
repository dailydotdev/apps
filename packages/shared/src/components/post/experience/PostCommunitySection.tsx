import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import PostEngagements from '../PostEngagements';
import { ConversationHubHeader } from './ConversationHubHeader';

interface PostCommunitySectionProps {
  post: Post;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  onCopyPostLink?: (post?: Post) => void;
}

export const PostCommunitySection = ({
  post,
  origin,
  shouldOnboardAuthor,
  onCopyPostLink,
}: PostCommunitySectionProps): ReactElement => {
  return (
    <section
      className="flex flex-col gap-4"
      data-testid="post-community-section"
    >
      <ConversationHubHeader post={post} />
      <div className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-default p-4 tablet:p-6">
        <PostEngagements
          post={post}
          onCopyLinkClick={onCopyPostLink}
          logOrigin={origin}
          shouldOnboardAuthor={shouldOnboardAuthor}
        />
      </div>
    </section>
  );
};
