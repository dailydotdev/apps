import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { ClickableText } from '../buttons/ClickableText';
import { largeNumberFormat } from '../../lib';
import { Image } from '../image/Image';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

interface PostUpvotesCommentsCountProps {
  post: Post;
  onUpvotesClick?: (upvotes: number) => unknown;
}

export function PostUpvotesCommentsCount({
  post,
  onUpvotesClick,
}: PostUpvotesCommentsCountProps): ReactElement {
  const { openModal } = useLazyModal();
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  const hasStats = upvotes > 0 || comments > 0 || post.views > 0 || awards > 0;

  return !hasStats ? (
    <></>
  ) : (
    <div
      className="mb-5 flex items-center gap-x-4 text-text-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.views > 0 && <span>{largeNumberFormat(post.views)} Views</span>}
      {upvotes > 0 && (
        <ClickableText onClick={() => onUpvotesClick(upvotes)}>
          {largeNumberFormat(upvotes)} Upvote{upvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {comments > 0 && (
        <span>
          {largeNumberFormat(comments)}
          {` Comment${comments === 1 ? '' : 's'}`}
        </span>
      )}
      {awards > 0 && (
        <span className="flex items-center gap-1">
          {!!post.featuredAward?.award && (
            <Image
              src={post.featuredAward.award.image}
              alt={post.featuredAward.award.name}
              className="size-6"
            />
          )}
          <ClickableText
            onClick={() => {
              openModal({
                type: LazyModal.ListAwards,
                props: {
                  queryProps: {
                    id: post.id,
                    type: 'POST',
                  },
                },
              });
            }}
          >
            {largeNumberFormat(awards)}
            {` Award${awards === 1 ? '' : 's'}`}
          </ClickableText>
        </span>
      )}
    </div>
  );
}
