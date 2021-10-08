import React, { ReactElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Comment } from '../../graphql/comments';
import {
  CardHeader,
  CardTextContainer,
  featuredCommentsToButtons,
} from './Card';
import ArrowIcon from '../../../icons/arrow.svg';
import CommentIcon from '../../../icons/comment.svg';
import { ForwardedButton as Button } from '../buttons/Button';

const LazyTooltip = dynamic(() => import('../tooltips/LazyTooltip'));

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
        <LazyTooltip content="Back" placement="bottom">
          <Button
            icon={<ArrowIcon style={{ transform: 'rotate(-90deg)' }} />}
            buttonSize="small"
            onClick={onBack}
            className="btn-tertiary"
          />
        </LazyTooltip>
        {featuredCommentsToButtons(
          featuredComments,
          onCommentClick,
          comment.id,
        )}
      </CardHeader>
      <h4 className="my-2 typo-body font-bold">{comment.author.name}</h4>
      <p className="m-0 p-0 flex-1 text-theme-label-tertiary typo-callout multi-truncate">
        {comment.content}
      </p>
      <div className="w-full h-px my-2 bg-theme-divider-tertiary" />
      <Link href={comment.permalink} passHref>
        <Button
          tag="a"
          target="_blank"
          rel="noopener"
          buttonSize="small"
          icon={<CommentIcon />}
          className="btn-tertiary self-center"
        >
          View comment
        </Button>
      </Link>
    </CardTextContainer>
  );
}
