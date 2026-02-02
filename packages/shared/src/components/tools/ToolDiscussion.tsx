import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { MockComment } from '../../lib/toolsMockData';
import { Image } from '../image/Image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ButtonColor,
} from '../buttons/Button';
import { UpvoteIcon } from '../icons';
import { largeNumberFormat } from '../../lib';

export interface ToolDiscussionProps {
  comments: MockComment[];
  upvotedComments: Set<string>;
  onUpvoteComment: (commentId: string) => void;
  className?: string;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const ToolDiscussion = ({
  comments,
  upvotedComments,
  onUpvoteComment,
  className,
}: ToolDiscussionProps): ReactElement => {
  return (
    <div className={classNames('flex flex-col', className)}>
      <h2 className="mb-4 font-bold text-text-primary typo-title3">
        Discussion
      </h2>
      <div className="mb-4 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
        <textarea
          className="w-full resize-none bg-transparent text-text-primary typo-body placeholder:text-text-quaternary focus:outline-none"
          placeholder="Share your thoughts about this tool..."
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
            Post comment
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {comments.map((comment) => {
          const isUpvoted = upvotedComments.has(comment.id);
          return (
            <article
              key={comment.id}
              className="flex gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4"
            >
              <Image
                className="size-10 rounded-full object-cover"
                src={comment.avatar}
                alt={`${comment.username}'s avatar`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary typo-callout">
                    {comment.username}
                  </span>
                  <span className="text-text-quaternary typo-footnote">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-text-secondary typo-body">
                  {comment.content}
                </p>
                <div className="mt-3">
                  <Button
                    variant={ButtonVariant.Tertiary}
                    color={isUpvoted ? ButtonColor.Avocado : undefined}
                    size={ButtonSize.XSmall}
                    pressed={isUpvoted}
                    onClick={() => onUpvoteComment(comment.id)}
                    icon={<UpvoteIcon secondary={isUpvoted} />}
                  >
                    {largeNumberFormat(comment.upvotes + (isUpvoted ? 1 : 0))}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
