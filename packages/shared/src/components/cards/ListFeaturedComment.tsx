import React, { ReactElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import {
  featuredCommentsToButtons,
  ListCardAside,
  ListCardDivider,
  ListCardMain,
} from './Card';
import ArrowIcon from '../../../icons/arrow.svg';
import CommentIcon from '../../../icons/comment.svg';
import { Button } from '../buttons/Button';
import { FeaturedCommentProps } from './FeaturedComment';

const Tooltip = dynamic(
  () => import(/* webpackChunkName: "tooltip" */ '../tooltips/Tooltip'),
);

export default function ListFeaturedComment({
  featuredComments,
  comment,
  onCommentClick,
  onBack,
  className,
}: FeaturedCommentProps): ReactElement {
  return (
    <div
      className={classNames('absolute inset-0 flex pt-4 pb-3 pr-4', className)}
    >
      <ListCardAside>
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
          'my-1',
          'top',
        )}
      </ListCardAside>
      <ListCardDivider />
      <ListCardMain>
        <h4 className="mb-1 font-bold typo-body">{comment.author.name}</h4>
        <p className="flex-1 p-0 m-0 text-theme-label-tertiary typo-callout multi-truncate">
          {comment.content}
        </p>
        <Link href={comment.permalink} passHref>
          <Button
            tag="a"
            target="_blank"
            rel="noopener"
            buttonSize="small"
            icon={<CommentIcon />}
            className="mt-auto btn-tertiary"
          >
            View comment
          </Button>
        </Link>
      </ListCardMain>
    </div>
  );
}
