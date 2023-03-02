import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post } from '../../graphql/posts';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { Button, ButtonProps } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import OptionsButton from '../buttons/OptionsButton';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import classed from '../../lib/classed';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "share" */ '../icons/Share'),
);

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onShare?: (post: Post) => unknown;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  children?: ReactNode;
  insaneMode?: boolean;
  openNewTab?: boolean;
}

type LastActionButtonProps = {
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onShare?: (post: Post) => unknown;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  post: Post;
};
function LastActionButton(props: LastActionButtonProps) {
  const { onShareClick, post } = props;
  const onClickShare = (event) => onShareClick?.(event, post);
  return (
    <SimpleTooltip content="Share post">
      <Button
        icon={<ShareIcon />}
        buttonSize="small"
        onClick={onClickShare}
        className="btn-tertiary-cabbage"
      />
    </SimpleTooltip>
  );
}

export default function ActionButtons({
  openNewTab,
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onMenuClick,
  onReadArticleClick,
  onShare,
  onShareClick,
  className,
  children,
  insaneMode,
}: ActionButtonsProps): ReactElement {
  const upvoteCommentProps: ButtonProps<'button'> = {
    buttonSize: 'small',
  };

  const lastActionButton = LastActionButton({
    post,
    onBookmarkClick,
    onShare,
    onShareClick,
  });

  const Container = classed('div', 'flex justify-between', className);

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        insaneMode && 'justify-between',
        className,
      )}
    >
      <ConditionalWrapper
        condition={insaneMode}
        wrapper={(leftChildren) => <Container>{leftChildren}</Container>}
      >
        <SimpleTooltip content={post.upvoted ? 'Remove upvote' : 'Upvote'}>
          <QuaternaryButton
            id={`post-${post.id}-upvote-btn`}
            icon={<UpvoteIcon secondary={post.upvoted} />}
            pressed={post.upvoted}
            onClick={() => onUpvoteClick?.(post, !post.upvoted)}
            {...upvoteCommentProps}
            className="btn-tertiary-avocado w-[4.875rem]"
          >
            <InteractionCounter
              value={post.numUpvotes > 0 && post.numUpvotes}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        <SimpleTooltip content="Comments">
          <QuaternaryButton
            id={`post-${post.id}-comment-btn`}
            icon={<CommentIcon secondary={post.commented} />}
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            {...upvoteCommentProps}
            className="btn-tertiary-blueCheese w-[4.875rem]"
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        {insaneMode && lastActionButton}
      </ConditionalWrapper>
      <ConditionalWrapper
        condition={insaneMode}
        wrapper={(rightChildren) => (
          <Container className={visibleOnGroupHover}>{rightChildren}</Container>
        )}
      >
        {insaneMode && (
          <ReadArticleButton
            className="mr-2 btn-primary"
            href={post.permalink}
            onClick={onReadArticleClick}
            openNewTab={openNewTab}
          />
        )}
        {!insaneMode && lastActionButton}
        {insaneMode && (
          <OptionsButton
            className={visibleOnGroupHover}
            onClick={onMenuClick}
            tooltipPlacement="top"
          />
        )}
        {children}
      </ConditionalWrapper>
    </div>
  );
}
