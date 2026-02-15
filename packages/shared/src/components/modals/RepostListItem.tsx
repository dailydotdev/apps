import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import FeedItemContainer from '../cards/common/list/FeedItemContainer';
import { CardContainer, CardTitle } from '../cards/common/list/ListCard';
import { PostCardHeader } from '../cards/common/list/PostCardHeader';
import SourceButton from '../cards/common/SourceButton';
import { ProfileImageSize } from '../ProfilePicture';
import { PostEngagementCounts } from '../cards/SimilarPosts';

interface RepostListItemProps {
  post: Post;
}

export function RepostListItem({ post }: RepostListItemProps): ReactElement {
  const isUserSource = isSourceUserSource(post.source);
  const title = post.title ?? post.sharedPost?.title;

  const metadata = useMemo(() => {
    if (isUserSource) {
      return {
        topLabel: post.author?.name,
      };
    }

    return {
      topLabel: post.source?.permalink ? (
        <Link href={post.source.permalink}>
          <a className="relative z-1">{post.source.name}</a>
        </Link>
      ) : (
        post.source?.name
      ),
      bottomLabel: post.author?.name,
    };
  }, [
    isUserSource,
    post.author?.name,
    post.source?.name,
    post.source?.permalink,
  ]);

  return (
    <FeedItemContainer
      domProps={{ className: 'px-4 py-3 first:border-t-0' }}
      linkProps={{ href: post.commentsPermalink, title: title || undefined }}
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader post={post} metadata={metadata}>
          {!isUserSource && post.source && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>
        {!!title && (
          <CardTitle className="mt-2 line-clamp-2 typo-callout">
            {title}
          </CardTitle>
        )}
        <PostEngagementCounts
          upvotes={post.numUpvotes ?? 0}
          comments={post.numComments ?? 0}
          className="mt-2 text-text-tertiary"
        />
      </CardContainer>
    </FeedItemContainer>
  );
}
