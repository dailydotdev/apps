import React, { ReactElement } from 'react';
import classNames from 'classnames';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useQueryClient } from 'react-query';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

interface CompanionEngagementsProps {
  post: PostBootData;
  commentsNum: number;
  isCommentsOpen: boolean;
  onCommentsClick?: () => void;
  onUpvotesClick?: () => unknown;
}

export function CompanionEngagements({
  post,
  commentsNum,
  isCommentsOpen,
  onCommentsClick,
  onUpvotesClick,
}: CompanionEngagementsProps): ReactElement {
  if (!post) {
    return null;
  }

  const client = useQueryClient();
  useRawBackgroundRequest(({ res, key }) => {
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
      {post.numUpvotes <= 0 && <span>Be the first to upvote</span>}
      {post.numUpvotes > 0 && (
        <ClickableText onClick={onUpvotesClick}>
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
        {commentsNum.toLocaleString()}
        {` Comment${commentsNum === 1 ? '' : 's'}`}
      </Button>
    </div>
  );
}
