import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import {
  Post,
  UserPostVote,
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
} from '../../graphql/posts';
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
import { getReadArticleLink } from '../utilities';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "share" */ '../icons/Share'),
);

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onShare?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
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
  onBookmarkClick,
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
          <QuaternaryButton
            id={`post-${post.id}-bookmark-btn`}
            icon={<BookmarkIcon secondary={post.bookmarked} />}
            onClick={() => onBookmarkClick(post)}
            className="btn-tertiary-bun !min-w-[4.625rem]"
            pressed={post.bookmarked}
            {...upvoteCommentProps}
          />
        </SimpleTooltip>
      )}
      {lastActionButton}
    </>
  );

  return (
    <div
      className={classNames(
        'flex flex-row items-center justify-between',
        !insaneMode && !bookmarkOnCard && 'mx-4',
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
            className="btn-tertiary-avocado !min-w-[4.625rem]"
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
            className="btn-tertiary-blueCheese !min-w-[4.625rem]"
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
          {!isInternalReadType(post) && (
            <ReadArticleButton
              content={getReadPostButtonText(post)}
              className="mr-2 btn-primary"
              href={getReadArticleLink(post)}
              onClick={onReadArticleClick}
              openNewTab={!isSharedPostSquadPost(post) && openNewTab}
            />
          )}
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
