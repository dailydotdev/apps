import type { ReactElement } from 'react';
import React from 'react';
import { FreeformFeaturedWideGridCard } from '../../../components/cards/Freeform/FreeformFeaturedWideGridCard';
import type { Post } from '../../../graphql/posts';
import { PostType, UserVote } from '../../../graphql/posts';
import { SourceType } from '../../../graphql/sources';
import type { InterestPost } from '../../../graphql/interests';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';

const noop = () => undefined;

const toHeroPost = (post: InterestPost, query: string): Post =>
  ({
    ...post,
    type: PostType.Freeform,
    image: cloudinaryPostImageCoverPlaceholder,
    readTime: 4,
    numUpvotes: 0,
    numComments: 0,
    numAwards: 0,
    slug: post.id,
    tags: [query.toLowerCase(), 'agent summary'],
    source: {
      id: 'agent-source',
      handle: 'your-agent',
      name: 'Your agent',
      permalink: '',
      image: cloudinaryPostImageCoverPlaceholder,
      type: SourceType.Machine,
      public: false,
    },
    bookmarked: false,
    upvoted: false,
    commented: false,
    read: false,
    private: true,
    clickbaitTitleDetected: false,
    userState: { vote: UserVote.None },
  } as unknown as Post);

export const AgentHeroCard = ({
  post,
  query,
}: {
  post: InterestPost;
  query: string;
}): ReactElement => (
  <div
    className="flex h-full w-full [&>*]:h-full [&>*]:w-full"
    style={{ gridColumn: '1 / -1' }}
  >
    <FreeformFeaturedWideGridCard
      post={toHeroPost(post, query)}
      wideColSpan={4}
      onPostClick={noop}
      onPostAuxClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onCommentClick={noop}
      onBookmarkClick={noop}
      onCopyLinkClick={noop}
      onShare={noop}
    />
  </div>
);
