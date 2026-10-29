import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { BlockIcon } from '../../../components/icons/Block';
import { EyeCancelIcon } from '../../../components/icons/EyeCancel';
import { HashtagIcon } from '../../../components/icons/Hashtag';
import { MinusIcon } from '../../../components/icons/Minus';
import { PlusIcon } from '../../../components/icons/Plus';
import { IconSize } from '../../../components/Icon';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { SourceAvatar } from '../../../components/profile/source/SourceAvatar';
import { ProfileImageSize } from '../../../components/ProfilePicture';
import { AuthorSourceStack } from '../../../components/cards/common/AuthorSourceStack';
import { TypeLabel } from '../../../components/cards/common/list/TypeLabel';
import type { Post } from '../../../graphql/posts';
import { SourceType } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import useFeedSettings from '../../../hooks/useFeedSettings';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { useHidePost } from '../../../hooks/post/useHidePost';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { LogEvent, Origin } from '../../../lib/log';
import { usePostLogEvent } from '../../../lib/feed';
import type { FeedItemExplain, FeedProfile } from '../types';
import {
  ExplainOrigin,
  FeedSourceMode,
  FeedTopicMode,
  isRankedExplain,
  TopicControl,
} from '../types';
import type { ExplainSignal } from '../describe';
import {
  ExplainSignalKind,
  getExplainSignals,
  getReason,
  getReasonDotClassName,
} from '../describe';
import { feedProfileQueryKey, feedProfileQueryOptions } from '../queries';
import { useFeedExplainMode } from '../useFeedExplainMode';
import { useDropIdleForYouFeeds } from '../useDropIdleForYouFeeds';
import type { UseFeedControls } from '../useFeedControls';
import { useFeedControls } from '../useFeedControls';
import { TopicLevelPicker } from './TopicLevelPicker';
import { ShowLessTopicOffer } from './ShowLessTopicOffer';

const signalLimit = 3;

interface RowContext {
  post: Post;
  explain: FeedItemExplain | null;
  profile?: FeedProfile;
  version: number;
  size: ButtonSize;
  feedControls: UseFeedControls;
}

/**
 * Explain mode keeps only where the post is from and its title, at the
 * offsets the real card draws them so nothing on it moves.
 */
const CardHead = ({
  post,
  position,
  isList,
}: {
  post: Post;
  position?: number;
  isList: boolean;
}): ReactElement => {
  const place = position ? (
    <span
      className="ml-auto shrink-0 tabular-nums text-text-quaternary typo-footnote"
      title="Place in your feed"
    >
      #{position}
    </span>
  ) : null;
  const title = post.title || post.sharedPost?.title;

  return (
    <div
      className={classNames(
        'flex flex-col',
        isList ? 'px-4 pt-6' : 'mx-4 mt-4',
      )}
    >
      {isList ? (
        <span
          className={classNames(
            'mb-2 flex items-center gap-4',
            post.author ? 'h-9' : 'h-10',
          )}
        >
          {post.author && (
            <AuthorSourceStack author={post.author} source={post.source} />
          )}
          {!post.author && post.source && (
            <SourceAvatar
              source={post.source}
              size={ProfileImageSize.Large}
              className="!mr-0"
            />
          )}
          <span
            className={classNames(
              'min-w-0 shrink self-start truncate font-bold text-text-primary typo-footnote',
              !post.author && 'mt-0.5',
            )}
          >
            {post.source?.name}
          </span>
          {place}
        </span>
      ) : (
        <span className="mb-1 flex h-8 items-center gap-2">
          <AuthorSourceStack author={post.author} source={post.source} />
          <span className="min-w-0 shrink truncate text-text-tertiary typo-footnote">
            {post.source?.name}
          </span>
          {place}
        </span>
      )}
      <h3
        className={classNames(
          'line-clamp-3 break-words font-bold text-text-primary typo-title3',
          isList ? 'mr-4 mt-4' : 'mt-2',
        )}
      >
        {title}
      </h3>
    </div>
  );
};

const ReasonLine = ({
  post,
  explain,
}: Pick<RowContext, 'post' | 'explain'>): ReactElement => {
  const { lead, name, tail } = getReason(post, explain);

  return (
    <p className="flex gap-2 typo-footnote">
      <span
        className={classNames(
          'mt-1.5 size-2 shrink-0 rounded-max',
          getReasonDotClassName(explain),
        )}
      />
      <span className="line-clamp-2 min-w-0 shrink text-text-secondary">
        {lead}
        {name && (
          <strong className="font-bold text-text-primary">{name}</strong>
        )}
        {tail}
      </span>
    </p>
  );
};

interface SignalMeta {
  text: string;
  className: string;
}

const topicModeMeta: Record<FeedTopicMode, SignalMeta> = {
  [FeedTopicMode.Boost]: {
    text: 'Showing more',
    className: 'text-accent-avocado-default',
  },
  [FeedTopicMode.Demote]: {
    text: 'Showing less',
    className: 'text-accent-bun-default',
  },
  [FeedTopicMode.StopLearning]: {
    text: 'Not learning from your reading',
    className: 'text-accent-ketchup-default',
  },
  [FeedTopicMode.Off]: {
    text: 'Off in For You',
    className: 'text-accent-ketchup-default',
  },
};

const getTopicMeta = (
  tag: string,
  {
    explain,
    profile,
    feedControls,
  }: Pick<RowContext, 'explain' | 'profile' | 'feedControls'>,
  isFollowed: boolean,
): SignalMeta => {
  const interest = profile?.interests.find((item) => item.tag === tag);
  const match = isRankedExplain(explain) ? explain.match : undefined;
  const stories =
    interest?.stories ?? (match?.tag === tag ? match.stories : undefined) ?? 0;
  const mode = feedControls.getTopicMode(tag);
  if (mode) {
    return topicModeMeta[mode];
  }
  // The profile lags a change behind the controls, so it only stands in
  // until they load.
  if (!feedControls.controls && profile?.muted.includes(tag)) {
    return topicModeMeta[FeedTopicMode.Off];
  }
  if (!feedControls.controls && interest?.control === TopicControl.Demote) {
    return topicModeMeta[FeedTopicMode.Demote];
  }
  const quiet = 'text-text-quaternary';
  if (stories) {
    return {
      text: `You've read ${stories} ${stories === 1 ? 'post' : 'posts'} on it`,
      className: quiet,
    };
  }
  if (isFollowed) {
    return { text: 'You follow it', className: quiet };
  }
  if (interest?.origin === ExplainOrigin.Set) {
    return { text: 'You set its boost', className: quiet };
  }
  return { text: 'Not one of your topics', className: quiet };
};

const getTopicWeight = (
  tag: string,
  { explain, profile }: Pick<RowContext, 'explain' | 'profile'>,
): { weight: number; isSet: boolean } | undefined => {
  // The profile is weighed with the reader's latest levels, the
  // explanation with the ones the card was ranked on.
  if (profile) {
    const interest = profile.interests.find((item) => item.tag === tag);
    return { weight: interest?.weight ?? 0, isSet: !!interest?.control };
  }
  if (isRankedExplain(explain) && explain.match?.tag === tag) {
    return { weight: explain.match.weight, isSet: !!explain.match.control };
  }
  return undefined;
};

const SignalRow = ({
  signal,
  context,
}: {
  signal: ExplainSignal;
  context: RowContext;
}): ReactElement => {
  const { post, size, version, feedControls } = context;
  const { user } = useAuthContext();
  const client = useQueryClient();
  const dropIdleFeeds = useDropIdleForYouFeeds();
  const { feedSettings } = useFeedSettings();
  const {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onFollowSource,
    onUnfollowSource,
    onBlockSource,
    onUnblockSource,
  } = useTagAndSource({
    origin: Origin.FeedExplain,
    postId: post.id,
    shouldInvalidateQueries: false,
  });
  const isTopic = signal.kind === ExplainSignalKind.Topic;
  const { source } = post;
  const isFollowed = isTopic
    ? !!feedSettings?.includeTags?.includes(signal.id)
    : !!feedSettings?.includeSources?.some(({ id }) => id === signal.id);
  const isBlocked = isTopic
    ? !!feedSettings?.blockedTags?.includes(signal.id)
    : !!feedSettings?.excludeSources?.some(({ id }) => id === signal.id);
  const canFollow = isTopic || source?.type === SourceType.Machine;
  const topicWeight = isTopic ? getTopicWeight(signal.id, context) : undefined;
  const topicMode = isTopic ? feedControls.getTopicMode(signal.id) : undefined;
  const isSourceDemoted = !isTopic && feedControls.isSourceDemoted(signal.id);
  let meta: SignalMeta;
  if (isBlocked) {
    meta = { text: 'Blocked', className: 'text-accent-ketchup-default' };
  } else if (isTopic) {
    meta = getTopicMeta(signal.id, context, isFollowed);
  } else if (isSourceDemoted) {
    meta = topicModeMeta[FeedTopicMode.Demote];
  } else {
    meta = {
      text: isFollowed ? 'You follow it' : "You don't follow it",
      className: 'text-text-quaternary',
    };
  }

  // A follow changes the weights the profile shows; a block only hides.
  const refreshProfile = () =>
    client.invalidateQueries({ queryKey: feedProfileQueryKey(user, version) });
  const onFollow = async () => {
    if (isTopic) {
      const tags = [signal.id];
      await (isFollowed ? onUnfollowTags({ tags }) : onFollowTags({ tags }));
      await refreshProfile();
    } else if (source) {
      await (isFollowed
        ? onUnfollowSource({ source })
        : onFollowSource({ source }));
    }
    dropIdleFeeds();
  };
  const onBlock = async () => {
    if (isTopic) {
      const tags = [signal.id];
      await (isBlocked ? onUnblockTags({ tags }) : onBlockTags({ tags }));
    } else if (source) {
      await (isBlocked
        ? onUnblockSource({ source })
        : onBlockSource({ source }));
    }
    dropIdleFeeds();
  };

  return (
    <li
      className={classNames(
        'flex items-center gap-3',
        size === ButtonSize.XSmall ? 'min-h-11' : 'min-h-12',
      )}
    >
      <span className={classNames('flex', isBlocked && 'opacity-50')}>
        {isTopic && (
          <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
            <HashtagIcon size={IconSize.Size16} secondary />
          </span>
        )}
        {!isTopic && source && (
          <SourceAvatar
            source={source}
            size={ProfileImageSize.Small}
            className="!mr-0"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={classNames(
              'min-w-0 shrink truncate font-bold typo-footnote',
              isBlocked
                ? 'text-text-tertiary line-through'
                : 'text-text-primary',
            )}
          >
            {signal.label}
          </span>
          {!isBlocked && topicWeight && (
            <TopicLevelPicker
              tag={signal.id}
              weight={topicWeight.weight}
              isSet={topicWeight.isSet || !!topicMode}
              mode={topicMode}
              onChange={(mode) => feedControls.setTopicMode(signal.id, mode)}
            />
          )}
        </span>
        <span className={classNames('truncate typo-caption1', meta.className)}>
          {meta.text}
        </span>
      </span>
      {isBlocked ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={onBlock}
        >
          Unblock
        </Button>
      ) : (
        <span className="flex items-center gap-0.5">
          {canFollow && (
            <Tooltip
              content={
                isFollowed
                  ? `Unfollow ${signal.label}. Its posts only show when your reading or other follows bring them.`
                  : `Follow ${signal.label}. Adds every post on it and ranks them higher.`
              }
            >
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                color={ButtonColor.Avocado}
                size={size}
                icon={<PlusIcon />}
                pressed={isFollowed}
                aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} ${
                  signal.label
                }`}
                onClick={onFollow}
              />
            </Tooltip>
          )}
          {!isTopic && (
            <Tooltip
              content={
                isSourceDemoted
                  ? `Set ${signal.label} back to Auto.`
                  : `Show less from ${signal.label}. Its posts rank lower, but the best ones still show.`
              }
            >
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                color={ButtonColor.Bun}
                size={size}
                icon={<MinusIcon />}
                pressed={isSourceDemoted}
                aria-label={`Show less from ${signal.label}`}
                onClick={() =>
                  feedControls.setSourceMode(
                    signal.id,
                    isSourceDemoted ? null : FeedSourceMode.Demote,
                  )
                }
              />
            </Tooltip>
          )}
          <Tooltip content={`Block ${signal.label}. Never shows.`}>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Ketchup}
              size={size}
              icon={<BlockIcon />}
              aria-label={`Block ${signal.label}`}
              onClick={onBlock}
            />
          </Tooltip>
        </span>
      )}
    </li>
  );
};

/**
 * The real card underneath sets the height, so the feed doesn't move. A card
 * shorter than its explanation, like a list card without an image, grows to
 * fit it instead of cutting it off.
 */
const useFitCard = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = content?.parentElement;
    const card = overlay?.parentElement;
    if (
      !content ||
      !overlay ||
      !card ||
      typeof ResizeObserver === 'undefined'
    ) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      const missing = content.offsetHeight - overlay.clientHeight;
      if (missing > 0) {
        card.style.minHeight = `${card.offsetHeight + missing}px`;
      }
    });
    observer.observe(content);

    return () => {
      observer.disconnect();
      card.style.minHeight = '';
    };
  }, []);

  return contentRef;
};

// The card stays underneath: its links and buttons leave the tab order and
// the accessibility tree while the explanation covers them.
const useCoverCard = (contentRef: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const overlay = contentRef.current?.parentElement;
    const covered = Array.from(overlay?.parentElement?.children ?? []).filter(
      (node) => node !== overlay,
    );
    covered.forEach((node) => node.setAttribute('inert', ''));

    return () => covered.forEach((node) => node.removeAttribute('inert'));
  }, [contentRef]);
};

interface FeedExplainCardProps {
  post: Post;
  explain: FeedItemExplain | null;
  isList: boolean;
}

/**
 * Explain mode over a feed card: why the post is here, its topics and source
 * with follow and block, Hide post and the full explanation. It covers
 * the real card, which stays underneath.
 */
export const FeedExplainCard = ({
  post,
  explain,
  isList,
}: FeedExplainCardProps): ReactElement => {
  const { user } = useAuthContext();
  const { version } = useFeedExplainMode();
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const { onHide, onUnhide } = useHidePost({
    post,
    origin: Origin.FeedExplain,
  });
  const dropIdleFeeds = useDropIdleForYouFeeds();
  const feedControls = useFeedControls({ origin: Origin.FeedExplain });
  // Cards without the hidden panel (polls, X posts) keep the explanation on
  // top, so it says the post is hidden instead.
  const [isHidden, setIsHidden] = useState(false);
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const size = isList ? ButtonSize.Small : ButtonSize.XSmall;
  const contentRef = useFitCard();
  useCoverCard(contentRef);
  const context: RowContext = {
    post,
    explain,
    profile,
    version,
    size,
    feedControls,
  };
  const matchTag = isRankedExplain(explain) ? explain.match?.tag : undefined;

  const onHidePost = async () => {
    const isDone = await onHide();
    if (isDone) {
      dropIdleFeeds();
      setIsHidden(true);
    }
    return isDone;
  };
  const onUndoHide = async () => {
    await onUnhide();
    setIsHidden(false);
  };

  const onOpenExplanation = () => {
    logEvent(
      postLogEvent(LogEvent.OpenFeedExplanation, post, {
        extra: { origin: Origin.FeedExplain, lane: explain?.lane },
      }),
    );
    openModal({
      type: LazyModal.FeedExplanation,
      props: { post, explain, onHide: onHidePost },
    });
  };

  return (
    <div
      className={classNames(
        'absolute inset-0 z-2 overflow-hidden rounded-16',
        isList ? 'bg-background-default' : 'bg-background-subtle',
      )}
    >
      <div ref={contentRef} className="relative flex min-h-full flex-col">
        {isList && <TypeLabel type={post.type} className="absolute left-3" />}
        <CardHead
          post={post}
          position={isRankedExplain(explain) ? explain.position : undefined}
          isList={isList}
        />
        <div
          className={classNames(
            'flex min-h-0 flex-1 flex-col gap-3 border-t border-border-subtlest-tertiary pt-4',
            isList ? 'mx-4 mt-4 pb-4' : 'mt-3 px-4 pb-2',
          )}
        >
          <ReasonLine post={post} explain={explain} />
          <ul className="flex min-h-0 flex-col gap-1">
            {getExplainSignals(post, explain, signalLimit).map((signal) => (
              <SignalRow
                key={`${signal.kind}:${signal.id}`}
                signal={signal}
                context={context}
              />
            ))}
          </ul>
          <div className="-mx-1.5 mt-auto flex flex-col gap-1">
            {isHidden && matchTag && (
              <ShowLessTopicOffer tag={matchTag} origin={Origin.FeedExplain} />
            )}
            <div className="flex items-center justify-between gap-2">
              {isHidden ? (
                <span className="flex items-center gap-1 pl-1.5 text-text-tertiary typo-footnote">
                  Post hidden
                  <Button
                    type="button"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    onClick={onUndoHide}
                  >
                    Undo
                  </Button>
                </span>
              ) : (
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<EyeCancelIcon />}
                  className="!text-text-tertiary"
                  onClick={onHidePost}
                >
                  Hide post
                </Button>
              )}
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<ArrowIcon className="rotate-90" />}
                iconPosition={ButtonIconPosition.Right}
                aria-haspopup="dialog"
                onClick={onOpenExplanation}
              >
                Full explanation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
