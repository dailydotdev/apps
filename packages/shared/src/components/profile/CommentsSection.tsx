import React, { ReactElement } from 'react';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import Link from 'next/link';
import { format } from 'date-fns';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import UpvoteIcon from '../icons/Upvote';
import { largeNumberFormat } from '../../lib/numberFormat';
import ActivitySection from './ActivitySection';
import {
  EmptyMessage,
  CommentContainer,
  CommentContent,
  CommentTime,
  commentInfoClass,
} from './common';

export type CommentsSectionProps = {
  userId: string;
  tokenRefreshed: boolean;
  isSameUser: boolean;
  numComments: number;
};

export default function CommentsSection({
  userId,
  tokenRefreshed,
  isSameUser,
  numComments,
}: CommentsSectionProps): ReactElement {
  const comments = useInfiniteQuery<UserCommentsData>(
    ['user_comments', userId],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, USER_COMMENTS_QUERY, {
        userId,
        first: 3,
        after: pageParam,
      }),
    {
      enabled: !!userId && tokenRefreshed,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  return (
    <ActivitySection
      title={`${isSameUser ? 'Your ' : ''}Comments`}
      query={comments}
      count={numComments}
      emptyScreen={
        <EmptyMessage data-testid="emptyComments">
          {isSameUser ? `You didn't comment yet.` : 'No comments yet.'}
        </EmptyMessage>
      }
      elementToNode={(comment) => (
        <CommentContainer key={comment.id}>
          <div className="flex flex-col tablet:flex-row tablet:justify-center items-center py-2 w-12 tablet:w-20 font-bold rounded-xl bg-theme-bg-secondary typo-callout">
            <UpvoteIcon className="tablet:mr-1 mb-1 tablet:mb-0 text-2xl icon" />
            {largeNumberFormat(comment.numUpvotes)}
          </div>
          <Link href={comment.permalink} passHref prefetch={false}>
            <a className={commentInfoClass} aria-label={comment.content}>
              <CommentContent>{comment.content}</CommentContent>
              <CommentTime dateTime={comment.createdAt}>
                {format(new Date(comment.createdAt), 'MMM d, y')}
              </CommentTime>
            </a>
          </Link>
        </CommentContainer>
      )}
    />
  );
}
