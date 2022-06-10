import React, { ReactElement } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { Comment } from '../../graphql/comments';
import {
  CardHeader,
  CardTextContainer,
  featuredCommentsToButtons,
} from './Card';
import ArrowIcon from '../icons/Arrow';
import CommentIcon from '../icons/Discuss';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export type FeaturedCommentProps = {
  featuredComments: Comment[];
  comment: Comment;
  onBack: () => unknown;
  onCommentClick: (comment: Comment) => unknown;
  className?: string;
};

export default function FeaturedComment({
  featuredComments,
  comment,
  onCommentClick,
  onBack,
  className,
}: FeaturedCommentProps): ReactElement {
  return (
    <CardTextContainer
      className={classNames('absolute inset-0 p-2', className)}
    >
      <CardHeader>
        <SimpleTooltip placement="bottom" content="Back">
          <Button
            icon={<ArrowIcon className="-rotate-90" />}
            buttonSize="small"
            onClick={onBack}
            className="btn-tertiary"
          />
        </SimpleTooltip>
        {featuredCommentsToButtons(
          featuredComments,
          onCommentClick,
          comment.id,
        )}
      </CardHeader>
      <h4 className="my-2 font-bold typo-body">{comment.author.name}</h4>
      <p className="flex-1 p-0 m-0 text-theme-label-tertiary typo-callout multi-truncate">
        {comment.content}
      </p>
      <div className="my-2 w-full h-px bg-theme-divider-tertiary" />
      <Link href={comment.permalink} passHref>
        <Button
          tag="a"
          target="_blank"
          rel="noopener"
          buttonSize="small"
          icon={<CommentIcon />}
          className="self-center btn-tertiary"
        >
          View comment
        </Button>
      </Link>
    </CardTextContainer>
  );
}
