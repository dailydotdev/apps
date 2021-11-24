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
import { Button } from '../buttons/Button';

const Tooltip = dynamic(
  () => import(/* webpackChunkName: "tooltip" */ '../tooltips/Tooltip'),
);

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
        <Tooltip placement="bottom" content="Back">
          <Button
            icon={<ArrowIcon style={{ transform: 'rotate(-90deg)' }} />}
            buttonSize="small"
            onClick={onBack}
            className="btn-tertiary"
          />
        </Tooltip>
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
