import React, { ReactElement } from 'react';
import { useInfiniteQuery } from 'react-query';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import { largeNumberFormat } from '../../lib/numberFormat';
import Link from 'next/link';
import { format } from 'date-fns';
import ActivitySection from './ActivitySection';
import {
  EmptyMessage,
  CommentContainer,
  CommentContent,
  CommentTime,
  commentInfoClass,
} from './common';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoCallout } from '../../styles/typography';
import { tablet } from '../../styles/media';

export type CommentsSectionProps = {
  userId: string;
  tokenRefreshed: boolean;
  isSameUser: boolean;
  numComments: number;
};

const CommentUpvotes = styled.div`
  display: flex;
  width: ${sizeN(12)};
  flex-direction: column;
  align-items: center;
  padding: ${sizeN(2)} 0;
  background: var(--theme-background-secondary);
  border-radius: ${sizeN(3)};
  font-weight: bold;
  ${typoCallout}

  .icon {
    font-size: ${sizeN(6)};
    margin-bottom: ${sizeN(1)};
  }

  ${tablet} {
    width: ${sizeN(20)};
    justify-content: center;
    flex-direction: row;

    .icon {
      margin-bottom: 0;
      margin-right: ${sizeN(1)};
    }
  }
`;

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
        userId: userId,
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
          <CommentUpvotes>
            <UpvoteIcon />
            {largeNumberFormat(comment.numUpvotes)}
          </CommentUpvotes>
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
