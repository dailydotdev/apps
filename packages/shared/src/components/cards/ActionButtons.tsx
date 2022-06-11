import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post } from '../../graphql/posts';
import rem from '../../../macros/rem.macro';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import BookmarkIcon from '../icons/Bookmark';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import FeaturesContext from '../../contexts/FeaturesContext';
import OptionsButton from '../buttons/OptionsButton';
import classed from '../../lib/classed';

const ShareIcon = dynamic(() => import('../icons/Forward'));

export type ActionButtonsProps = {
  post: Post;
  showShare: boolean;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onShare?: (post: Post) => unknown;
  className?: string;
  children?: ReactNode;
};

const visibleOnHover =
  'laptop:mouse:invisible laptop:mouse:group-hover:visible';
const getContainer = (displayWhenHovered = false) =>
  classed(
    'div',
    classNames('flex justify-between', displayWhenHovered && visibleOnHover),
  );

export default function ActionButtons({
  post,
  showShare,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onMenuClick,
  onShare,
  className,
  children,
}: ActionButtonsProps): ReactElement {
  const { postCardVersion, postEngagementNonClickable } =
    useContext(FeaturesContext);
  const isV2 = postCardVersion === 'v2';
  const buttonStyles = postEngagementNonClickable ? {} : { width: rem(78) };
  const LeftContainer = postEngagementNonClickable
    ? getContainer()
    : React.Fragment;
  const RightContainer = postEngagementNonClickable
    ? getContainer(isV2)
    : React.Fragment;

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        postEngagementNonClickable && 'justify-between',
        className,
      )}
    >
      <LeftContainer>
        <SimpleTooltip
          disabled={postEngagementNonClickable}
          content={post.upvoted ? 'Remove upvote' : 'Upvote'}
        >
          <QuaternaryButton
            readOnly={postEngagementNonClickable}
            id={`post-${post.id}-upvote-btn`}
            icon={
              <UpvoteIcon
                filled={post.upvoted || postEngagementNonClickable}
                size={postEngagementNonClickable ? 'small' : 'medium'}
              />
            }
            buttonSize="small"
            pressed={post.upvoted}
            onClick={() => onUpvoteClick?.(post, !post.upvoted)}
            style={buttonStyles}
            className="btn-tertiary-avocado"
          >
            <InteractionCounter
              value={post.numUpvotes > 0 && post.numUpvotes}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        <SimpleTooltip content="Comments" disabled={postEngagementNonClickable}>
          <QuaternaryButton
            readOnly={postEngagementNonClickable}
            id={`post-${post.id}-comment-btn`}
            icon={
              <CommentIcon
                filled={post.commented || postEngagementNonClickable}
                size={postEngagementNonClickable ? 'small' : 'medium'}
              />
            }
            buttonSize="small"
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            style={buttonStyles}
            className="btn-tertiary-avocado"
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </SimpleTooltip>
      </LeftContainer>
      <RightContainer>
        <SimpleTooltip
          content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Button
            icon={<BookmarkIcon filled={post.bookmarked} size="medium" />}
            buttonSize="small"
            pressed={post.bookmarked}
            onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
            className="btn-tertiary-bun"
          />
        </SimpleTooltip>
        {isV2 && (
          <OptionsButton className={visibleOnHover} onClick={onMenuClick} />
        )}
        {showShare && (
          <SimpleTooltip content="Share post">
            <Button
              icon={<ShareIcon />}
              buttonSize="small"
              onClick={() => onShare?.(post)}
              className="btn-tertiary"
            />
          </SimpleTooltip>
        )}
        {children}
      </RightContainer>
    </div>
  );
}
