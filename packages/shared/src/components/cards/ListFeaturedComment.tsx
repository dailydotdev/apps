import React, { ReactElement } from 'react';
import Link from 'next/link';
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
import { getTooltipProps } from '../../lib/tooltip';
import { FeaturedCommentProps } from './FeaturedComment';

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
        <Button
          icon={<ArrowIcon style={{ transform: 'rotate(-90deg)' }} />}
          buttonSize="small"
          {...getTooltipProps('Back', { position: 'down' })}
          onClick={onBack}
          className="btn-tertiary"
        />
        {featuredCommentsToButtons(
          featuredComments,
          onCommentClick,
          comment.id,
          'my-1',
          'up',
        )}
      </ListCardAside>
      <ListCardDivider />
      <ListCardMain>
        <h4 className="mb-1 typo-body font-bold">{comment.author.name}</h4>
        <p className="m-0 p-0 flex-1 text-theme-label-tertiary typo-callout multi-truncate">
          {comment.content}
        </p>
        <Link href={comment.permalink} passHref>
          <Button
            tag="a"
            target="_blank"
            rel="noopener"
            buttonSize="small"
            icon={<CommentIcon />}
            className="btn-tertiary mt-auto"
          >
            View comment
          </Button>
        </Link>
      </ListCardMain>
    </div>
  );
}
