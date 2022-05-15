import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { POST_UPVOTES_BY_ID_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import {
  DEFAULT_UPVOTES_PER_PAGE,
  UpvotesData,
} from '@dailydotdev/shared/src/graphql/common';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { getCompanionWrapper } from './common';
import { companionRequest } from './companionRequest';
import { useBackgroundPaginatedRequest } from './useBackgroundPaginatedRequest';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

interface CompanionDiscussionProps {
  post: PostBootData;
  isCommentsOpen: boolean;
  onCommentsClick?: () => void;
}

export function CompanionDiscussion({
  post,
  isCommentsOpen,
  onCommentsClick,
}: CompanionDiscussionProps): ReactElement {
  if (!post) {
    return null;
  }

  const client = useQueryClient();
  const queryKey = ['postUpvotes', post.id];
  useBackgroundPaginatedRequest(queryKey);
  const [isUpvotesOpen, setIsUpvotesOpen] = useState(false);
  const queryResult = useInfiniteQuery<UpvotesData>(
    queryKey,
    ({ pageParam }) =>
      companionRequest(`${apiUrl}/graphql`, POST_UPVOTES_BY_ID_QUERY, {
        id: post.id,
        first: DEFAULT_UPVOTES_PER_PAGE,
        after: pageParam,
        queryKey,
      }),
    {
      enabled: isUpvotesOpen,
      getNextPageParam: (lastPage) =>
        lastPage?.upvotes?.pageInfo?.hasNextPage &&
        lastPage?.upvotes?.pageInfo?.endCursor,
    },
  );

  useRawBackgroundRequest(({ res, queryKey: key }) => {
    if (!Array.isArray(key)) {
      return;
    }

    if (key[0] !== 'readingRank') {
      return;
    }

    client.setQueryData(key, res);
  });

  return (
    <div
      className="flex gap-x-4 justify-between items-center text-theme-label-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.numUpvotes <= 0 && post.numComments <= 0 && (
        <span>Be the first to upvote</span>
      )}
      {post.numUpvotes > 0 && (
        <ClickableText onClick={() => setIsUpvotesOpen(true)}>
          {post.numUpvotes} Upvote{post.numUpvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      <Button
        buttonSize="small"
        className={isCommentsOpen ? 'btn-secondary' : 'btn-primary'}
        rightIcon={
          <ArrowIcon
            className={classNames(
              'ml-2 w-6 h-6 transition-transform',
              !isCommentsOpen && 'rotate-180',
            )}
          />
        }
        onClick={onCommentsClick}
      >
        {post.numComments.toLocaleString()}
        {` Comment${post.numComments === 1 ? '' : 's'}`}
      </Button>
      {isUpvotesOpen && (
        <UpvotedPopupModal
          isOpen
          parentSelector={getCompanionWrapper}
          queryKey={queryKey}
          queryResult={queryResult}
          listPlaceholderProps={{ placeholderAmount: post?.numUpvotes }}
          onRequestClose={() => setIsUpvotesOpen(false)}
        />
      )}
    </div>
  );
}
