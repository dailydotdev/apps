import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post } from '../../graphql/posts';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import BookmarkIcon from '../icons/Bookmark';
import { Button, ButtonProps } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import OptionsButton from '../buttons/OptionsButton';
import classed from '../../lib/classed';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import { AdditionalInteractionButtons } from '../../lib/featureValues';

const ShareIcon = dynamic(() => import('../icons/Share'));

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onShare?: (post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  children?: ReactNode;
  additionalInteractionButtonFeature?: string;
  insaneMode?: boolean;
  postCardVersion?: string;
  postModalByDefault?: boolean;
  postEngagementNonClickable?: boolean;
}

const getContainer = (displayWhenHovered = false, className?: string) =>
  classed(
    'div',
    classNames(
      'flex justify-between',
      displayWhenHovered && visibleOnGroupHover,
      className,
    ),
  );

export default function ActionButtons({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onMenuClick,
  onReadArticleClick,
  onShare,
  className,
  children,
  insaneMode,
  postCardVersion,
  postModalByDefault,
  postEngagementNonClickable,
  additionalInteractionButtonFeature,
}: ActionButtonsProps): ReactElement {
  const isV2 = postCardVersion === 'v2';
  const separatedActions =
    (insaneMode && postModalByDefault) || postEngagementNonClickable;
  const LeftContainer = separatedActions ? getContainer() : React.Fragment;
  const RightContainer = separatedActions
    ? getContainer(isV2 || (insaneMode && postModalByDefault), 'ml-auto')
    : React.Fragment;
  const upvoteCommentProps: ButtonProps<'button'> = {
    readOnly: postEngagementNonClickable,
    buttonSize: 'small',
    className: classNames(
      'btn-tertiary-avocado',
      !postEngagementNonClickable && 'w-[4.875rem]',
    ),
  };

  const bookmarkOrShareButton =
    additionalInteractionButtonFeature ===
    AdditionalInteractionButtons.Bookmark ? (
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          buttonSize="small"
          pressed={post.bookmarked}
          onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
          className="btn-tertiary-bun"
        />
      </SimpleTooltip>
    ) : (
      <SimpleTooltip content="Share post">
        <Button
          icon={<ShareIcon />}
          buttonSize="small"
          onClick={() => onShare?.(post)}
          className="btn-tertiary-cabbage"
        />
      </SimpleTooltip>
    );

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        separatedActions && 'justify-between',
        insaneMode && isV2 && 'flex-1',
        className,
      )}
    >
      <LeftContainer>
        <SimpleTooltip
          disabled={postEngagementNonClickable}
          content={post.upvoted ? 'Remove upvote' : 'Upvote'}
        >
          <QuaternaryButton
            id={`post-${post.id}-upvote-btn`}
            icon={
              <UpvoteIcon
                secondary={post.upvoted || postEngagementNonClickable}
              />
            }
            pressed={post.upvoted}
            onClick={() => onUpvoteClick?.(post, !post.upvoted)}
            {...upvoteCommentProps}
          >
            {postEngagementNonClickable && !post.numUpvotes ? null : (
              <InteractionCounter
                value={post.numUpvotes > 0 && post.numUpvotes}
              />
            )}
          </QuaternaryButton>
        </SimpleTooltip>
        <SimpleTooltip content="Comments" disabled={postEngagementNonClickable}>
          <QuaternaryButton
            id={`post-${post.id}-comment-btn`}
            icon={
              <CommentIcon
                secondary={post.commented || postEngagementNonClickable}
              />
            }
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            {...upvoteCommentProps}
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        {insaneMode &&
          postModalByDefault &&
          !postEngagementNonClickable &&
          bookmarkOrShareButton}
      </LeftContainer>
      <RightContainer>
        {insaneMode && postModalByDefault && (
          <ReadArticleButton
            href={post.permalink}
            className="btn-tertiary"
            onClick={onReadArticleClick}
          />
        )}
        {(!insaneMode || !postModalByDefault || postEngagementNonClickable) &&
          bookmarkOrShareButton}

        {(isV2 || insaneMode) && (
          <OptionsButton
            className={classNames(
              visibleOnGroupHover,
              insaneMode && !postModalByDefault && 'ml-auto',
            )}
            onClick={onMenuClick}
            tooltipPlacement="top"
          />
        )}
        {children}
      </RightContainer>
    </div>
  );
}
