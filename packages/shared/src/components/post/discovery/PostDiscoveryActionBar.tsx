import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { POST_REPOSTS_BY_ID_QUERY, UserVote } from '../../../graphql/posts';
import { useVotePost } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { useCanAwardUser } from '../../../hooks/useCoresFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { Origin } from '../../../lib/log';
import { AuthTriggers } from '../../../lib/auth';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { ClickableText } from '../../buttons/ClickableText';
import { BookmarkButton } from '../../buttons/BookmarkButton';
import { UpvoteButtonIcon } from '../../cards/common/UpvoteButtonIcon';
import { Image } from '../../image/Image';
import { IconSize } from '../../Icon';
import {
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  UserShareIcon,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
import type { LoggedUser } from '../../../lib/user';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { PostMenuOptions } from '../PostMenuOptions';
import { PostClickbaitShield } from '../common/PostClickbaitShield';

interface PostDiscoveryActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  className?: string;
}

const countClassName = '!text-text-secondary typo-footnote';

/**
 * Compact, border-framed engagement bar for the discovery focus card. Each
 * action keeps its count inline: the icon performs the action (vote, comment,
 * give award) while the number is separately clickable to open the matching
 * popup (who upvoted, awards, reposts). Right side keeps icon-only utilities.
 */
export const PostDiscoveryActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  className,
}: PostDiscoveryActionBarProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onShowPanel, onClose } = useBlockPostPanel(post);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openModal } = useLazyModal();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  const reposts = post.numReposts || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });
  const showAward = canAward || awards > 0;

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onClose(true);
    }
    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }
    await toggleDownvote({ payload: post, origin });
  };

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  const onShowAwards = () =>
    openModal({
      type: LazyModal.ListAwards,
      props: { queryProps: { id: post.id, type: 'POST' } },
    });

  const onAwardIconClick = () => {
    if (canAward && !isAwarded) {
      if (!user) {
        showLogin({ trigger: AuthTriggers.GiveAward });
        return;
      }
      if (!post.author) {
        return;
      }
      openModal({
        type: LazyModal.GiveAward,
        props: {
          type: 'POST',
          entity: {
            id: post.id,
            receiver: post.author,
            numAwards: post.numAwards,
          },
          post,
        },
      });
      return;
    }
    if (awards > 0) {
      onShowAwards();
    }
  };

  const onShowReposts = () =>
    openModal({
      type: LazyModal.RepostsPopup,
      props: {
        requestQuery: {
          queryKey: ['postReposts', post.id],
          query: POST_REPOSTS_BY_ID_QUERY,
          params: { id: post.id, first: 20, supportedTypes: ['share'] },
        },
      },
    });

  return (
    <div
      className={classNames(
        'my-2 flex items-center justify-between gap-4 border-y border-border-subtlest-tertiary px-1 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'More like this'}>
          <Button
            id="upvote-post-btn"
            aria-label="Upvote"
            color={ButtonColor.Avocado}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={IconSize.Small}
              />
            }
            onClick={onToggleUpvote}
            pressed={isUpvoteActive}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {upvotes > 0 && (
          <Tooltip content="See who upvoted">
            <ClickableText
              className={classNames('mr-1', countClassName)}
              onClick={() => onShowUpvoted(post.id, upvotes)}
            >
              {largeNumberFormat(upvotes)}
            </ClickableText>
          </Tooltip>
        )}
        <Tooltip
          content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
        >
          <Button
            id="downvote-post-btn"
            aria-label="Downvote"
            color={ButtonColor.Ketchup}
            icon={
              <DownvoteIcon
                secondary={isDownvoteActive}
                size={IconSize.Small}
              />
            }
            onClick={onToggleDownvote}
            pressed={isDownvoteActive}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <Button
            id="comment-post-btn"
            aria-label="Comment"
            color={ButtonColor.BlueCheese}
            icon={
              <CommentIcon secondary={post.commented} size={IconSize.Small} />
            }
            onClick={onComment}
            pressed={post.commented}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {comments > 0 && (
          <span className={classNames('mr-1', countClassName)}>
            {largeNumberFormat(comments)}
          </span>
        )}
        {showAward && (
          <>
            <Tooltip
              content={isAwarded ? 'You already awarded this post!' : 'Award'}
            >
              <Button
                id="award-post-btn"
                aria-label="Award"
                color={ButtonColor.Cabbage}
                icon={
                  <MedalBadgeIcon
                    secondary={!isAwarded}
                    size={IconSize.Small}
                  />
                }
                onClick={onAwardIconClick}
                pressed={isAwarded}
                size={ButtonSize.Small}
                type="button"
                variant={ButtonVariant.Tertiary}
              />
            </Tooltip>
            {awards > 0 && (
              <Tooltip content="See awards">
                <ClickableText
                  className={classNames(
                    'mr-1 flex items-center gap-1',
                    countClassName,
                  )}
                  onClick={onShowAwards}
                >
                  {post.featuredAward?.award?.image && (
                    <Image
                      src={post.featuredAward.award.image}
                      alt={post.featuredAward.award.name ?? 'Award'}
                      className="size-4"
                    />
                  )}
                  {largeNumberFormat(awards)}
                </ClickableText>
              </Tooltip>
            )}
          </>
        )}
        {reposts > 0 && (
          <Tooltip content="See who reposted">
            <ClickableText
              className={classNames(
                'ml-1 flex items-center gap-1',
                countClassName,
              )}
              onClick={onShowReposts}
            >
              <UserShareIcon size={IconSize.Small} />
              {largeNumberFormat(reposts)}
            </ClickableText>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <BookmarkButton
          post={post}
          iconSize={IconSize.Small}
          buttonProps={{
            id: 'bookmark-post-btn',
            pressed: post.bookmarked,
            onClick: onToggleBookmark,
            size: ButtonSize.Small,
          }}
        />
        <Tooltip content="Copy link">
          <Button
            aria-label="Copy link"
            color={ButtonColor.Cabbage}
            icon={<LinkIcon size={IconSize.Small} />}
            onClick={() => onCopyLinkClick?.(post)}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {post.clickbaitTitleDetected && (
          <PostClickbaitShield post={post} iconOnly />
        )}
        {canSeeAnalytics && (
          <Tooltip content="Analytics">
            <Link
              href={`${webappUrl}posts/${post.id}/analytics`}
              passHref
              prefetch={false}
            >
              <Button
                aria-label="Analytics"
                icon={<AnalyticsIcon size={IconSize.Small} />}
                size={ButtonSize.Small}
                tag="a"
                variant={ButtonVariant.Tertiary}
              />
            </Link>
          </Tooltip>
        )}
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={ButtonSize.Small}
        />
      </div>
    </div>
  );
};
