import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post, UserPostVote } from '../../graphql/posts';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import OptionsButton from '../buttons/OptionsButton';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import { useFeedPreviewMode } from '../../hooks';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import BookmarkIcon from '../icons/Bookmark';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "share" */ '../icons/Share'),
);

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onShare?: (post: Post) => unknown;
  onBookmark?: (post: Post) => unknown;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  insaneMode?: boolean;
  openNewTab?: boolean;
}

type LastActionButtonProps = {
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
        buttonSize={ButtonSize.Small}
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
  onMenuClick,
  onReadArticleClick,
  onShare,
  onBookmark,
  onShareClick,
  className,
  insaneMode,
}: ActionButtonsProps): ReactElement {
  const bookmarkOnCard = useFeature(feature.bookmarkOnCard);
  const upvoteCommentProps: ButtonProps<'button'> = {
    buttonSize: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  const lastActionButton = LastActionButton({
    post,
    onShare,
    onShareClick,
  });
  const lastActions = (
    <>
      {bookmarkOnCard && (
        <SimpleTooltip
          content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Button
            icon={<BookmarkIcon secondary={post.bookmarked} />}
            buttonSize={ButtonSize.Small}
            onClick={() => onBookmark(post)}
            className="btn-tertiary-bun"
            pressed={post.bookmarked}
          />
        </SimpleTooltip>
      )}
      {lastActionButton}
    </>
  );

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
        wrapper={(leftChildren) => (
          <div className="flex justify-between">{leftChildren}</div>
        )}
      >
        <SimpleTooltip
          content={
            post?.userState?.vote === UserPostVote.Up
              ? 'Remove upvote'
              : 'Upvote'
          }
        >
          <QuaternaryButton
            id={`post-${post.id}-upvote-btn`}
            icon={
              <UpvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Up}
              />
            }
            pressed={post?.userState?.vote === UserPostVote.Up}
            onClick={() => onUpvoteClick?.(post)}
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
        {insaneMode && lastActions}
      </ConditionalWrapper>
      {insaneMode ? (
        <div
          className={classNames('flex justify-between', visibleOnGroupHover)}
        >
          <ReadArticleButton
            className="mr-2 btn-primary"
            href={post.permalink}
            onClick={onReadArticleClick}
            openNewTab={openNewTab}
          />
          <OptionsButton
            className={visibleOnGroupHover}
            onClick={onMenuClick}
            tooltipPlacement="top"
          />
        </div>
      ) : (
        lastActions
      )}
    </div>
  );
}
