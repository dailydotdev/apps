import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DiscussIcon as CommentIcon } from '../icons/Discuss';
import { DownvoteIcon } from '../icons/Downvote';
import { LinkIcon } from '../icons/Link';
import { MedalBadgeIcon } from '../icons/MedalBadge';
import type { Post } from '../../graphql/posts';
import { PostType, UserVote } from '../../graphql/posts';
import { CardAction } from '../buttons/CardAction';
import { BookmarkButton } from '../buttons/BookmarkButton.v2';
import { ButtonColor } from '../buttons/ButtonV2';
import { UpvoteButtonIcon } from '../cards/common/UpvoteButtonIcon';
import { LazyModal } from '../modals/common/types';
import { useVotePost } from '../../hooks/vote/useVotePost';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { usePostActions } from '../../hooks/post/usePostActions';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useIsPhone, useIsPhoneLandscape } from '../../hooks/useViewSize';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useMobileAppFooterContext } from '../../features/getApp/contexts/MobileAppFooterContext';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { postLogEvent } from '../../lib/feed';
import { AuthTriggers } from '../../lib/auth';
import type { LoggedUser } from '../../lib/user';
import type { Origin } from '../../lib/log';
import { LogEvent, Origin as LogOrigin } from '../../lib/log';
import { cluster, field, lerp, motion } from '../shell/constants';
import { useRegisterShellField } from '../shell/shellFieldStore';
import { useShellScroll } from '../shell/useShellScroll';
import { hidesCluster } from '../shell/shellNav';
import { useReading } from '../shell/readingStore';
import { RootPortal } from '../tooltips/Portal';

export interface PostCapsuleProps {
  post: Post;
  onCommentClick: (origin: Origin) => void;
}

// The phone post page carries its actions in the capsule alone, unless the
// app footer owns the bottom or the post type has no actions bar.
export const useHasPostCapsule = (post?: Pick<Post, 'type'>): boolean => {
  const { title: appFooterTitle } = useMobileAppFooterContext();

  return !!post && post.type !== PostType.Brief && !appFooterTitle;
};

const transition = ['transform', 'bottom', 'height', 'border-radius', 'padding']
  .map((property) => `${property} ${motion.snap}ms ${motion.interaction}`)
  .join(', ');

export interface PostCapsulePosition {
  p: number;
  // The capsule's bottom edge at rest, as a CSS length.
  bottom: string;
  // How far it slides down into the bar's slot while reading.
  translateY: number;
  height: number;
}

// Where the capsule stands: one gap above the bottom bar, sliding into the
// bar's slot while reading. Anything floating over the capsule (the live
// chat pill) reads it here, so the two never cover each other.
export const usePostCapsulePosition = (): PostCapsulePosition => {
  // Sideways the bar stays compact, so the capsule stands on its compact top.
  const barHeight = useIsPhoneLandscape() ? cluster.compact : cluster.rest;
  const router = useRouter();
  // In the reading drawer the bar has folded away and the capsule stands on
  // the floor at its rest size: the drawer's scroll is not the page's.
  const { open: isReading } = useReading();
  const hasBar =
    !isReading && !hidesCluster(router?.pathname ?? '', router?.asPath);
  const { p: pageP } = useShellScroll();
  const p = isReading ? 0 : pageP;
  const lift = hasBar ? barHeight + field.gap : 0;

  return {
    p,
    bottom: `calc(${cluster.floor} + ${lift}px)`,
    translateY: p * lift,
    height: lerp(field.rest, field.compact, p),
  };
};

export const postCapsuleTransition = transition;

// The post page's actions, floating one gap above the bottom bar. While
// reading, the bar slides below the screen and the capsule takes its slot
// at the compact size, the way the search field does.
export function PostCapsule({
  post,
  onCommentClick,
}: PostCapsuleProps): ReactElement | null {
  const origin = LogOrigin.ArticlePage;
  const isPhone = useIsPhone();
  const { p, bottom, translateY, height } = usePostCapsulePosition();
  useRegisterShellField(isPhone);
  // Icons swap in with a short scale and blur once the reader has touched
  // the capsule; the first paint shows them as they are.
  const [isTouched, setIsTouched] = useState(false);

  const { user, showLogin } = useAuthContext();
  const { openModal } = useLazyModal();
  const { onClose, onShowPanel } = useBlockPostPanel(post);
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onInteract } = usePostActions({ post });
  const { getUpvoteAnimation } = useBrandSponsorship();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  // Match the desktop `PostActions` copy flow: fetch the short URL imperatively
  // on click so anonymous users still get a usable (long) link instead of a no-op.
  const { getShortUrl } = useGetShortUrl();
  const [, copyLink] = useCopyPostLink();
  const { logEvent } = useLogContext();

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;
  const isCompact = p === 1;
  const upvoteCount = isCompact ? undefined : post.numUpvotes;
  const commentCount = isCompact ? undefined : post.numComments;

  const brandAnimation = useMemo(() => {
    const animationResult = getUpvoteAnimation(post.tags || []);
    if (
      !animationResult.shouldAnimate ||
      !animationResult.colors ||
      !animationResult.config
    ) {
      return null;
    }
    return {
      colors: animationResult.colors,
      config: animationResult.config,
      brandLogo: animationResult.brandLogo,
    };
  }, [getUpvoteAnimation, post.tags]);

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onClose(true);
    }
    if (post?.userState?.vote !== UserVote.Up) {
      onInteract('upvote');
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

  const onGiveAward = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.GiveAward });
      return;
    }
    if (!post.author || isAwarded) {
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
  };

  const onCopyLink = useCallback(async () => {
    const shortLink = await getShortUrl(
      post.commentsPermalink,
      ReferralCampaignKey.SharePost,
    );
    copyLink({ link: shortLink });
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin },
      }),
    );
  }, [copyLink, getShortUrl, logEvent, origin, post]);

  // A portal cannot hydrate, so the capsule mounts once the client knows it
  // is on a phone, together with the bar and the field.
  if (!isPhone) {
    return null;
  }

  return (
    <RootPortal>
      <div
        className="shell-capsule pointer-events-none fixed inset-x-0 z-3 motion-reduce:!transition-none tablet:hidden"
        style={{
          bottom,
          paddingInline: lerp(cluster.inset, cluster.insetCompact, p),
          transform: `translateY(${translateY}px)`,
          transition,
        }}
      >
        <div
          onPointerDown={() => setIsTouched(true)}
          className={classNames(
            'shell-material shell-material-action pointer-events-auto flex w-full items-center justify-between px-1 motion-reduce:!transition-none',
            isTouched && 'shell-icon-swap',
          )}
          style={{
            height,
            borderRadius: lerp(field.radiusRest, field.radiusCompact, p),
            transition,
          }}
        >
          <CardAction
            id="mobile-upvote-post-btn"
            label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            icon={<UpvoteButtonIcon brandAnimation={brandAnimation} />}
            iconPressed={
              <UpvoteButtonIcon secondary brandAnimation={brandAnimation} />
            }
            count={upvoteCount}
            color={ButtonColor.Avocado}
            className="shell-press"
          />
          <CardAction
            id="mobile-downvote-post-btn"
            label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            color={ButtonColor.Ketchup}
            className="shell-press"
          />
          <CardAction
            id="mobile-comment-post-btn"
            label="Comment"
            pressed={post.commented}
            onClick={() => onCommentClick(LogOrigin.PostCommentButton)}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            count={commentCount}
            color={ButtonColor.BlueCheese}
            className="shell-press"
          />
          {canAward && (
            <CardAction
              id="mobile-award-post-btn"
              label="Award"
              pressed={isAwarded}
              onClick={onGiveAward}
              icon={<MedalBadgeIcon />}
              iconPressed={<MedalBadgeIcon secondary />}
              color={ButtonColor.Cabbage}
              className="shell-press"
            />
          )}
          <BookmarkButton
            post={post}
            id="mobile-bookmark-post-btn"
            pressed={post.bookmarked}
            onClick={onToggleBookmark}
            className="shell-press"
          />
          <CardAction
            id="mobile-copy-post-btn"
            label="Copy link"
            onClick={onCopyLink}
            icon={<LinkIcon />}
            color={ButtonColor.Cabbage}
            className="shell-press"
          />
        </div>
      </div>
    </RootPortal>
  );
}
