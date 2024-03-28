import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Post,
  UserPostVote,
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
} from '../../graphql/posts';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  BookmarkIcon,
  LinkIcon,
} from '../icons';
import {
  Button,
  ButtonColor,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import OptionsButton from '../buttons/OptionsButton';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import { useFeedPreviewMode } from '../../hooks';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { getReadArticleLink } from '../utilities';

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
  onCopyLinkClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  insaneMode?: boolean;
  openNewTab?: boolean;
}

export default function ActionButtons({
  openNewTab,
  post,
  onUpvoteClick,
  onCommentClick,
  onMenuClick,
  onReadArticleClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
  insaneMode,
}: ActionButtonsProps): ReactElement {
  const bookmarkOnCard = useFeature(feature.bookmarkOnCard);
  const upvoteCommentProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

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
      <SimpleTooltip content="Copy link">
        <Button
          size={ButtonSize.Small}
          icon={<LinkIcon />}
          onClick={(e) => onCopyLinkClick?.(e, post)}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </SimpleTooltip>
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
              className="mr-2"
              variant={ButtonVariant.Primary}
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
