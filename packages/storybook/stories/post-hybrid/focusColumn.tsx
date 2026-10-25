import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
  isInternalReadType,
  isSocialTwitterPost,
  isVideoPost,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import type { SourceTooltip } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import usePostContent from '@dailydotdev/shared/src/hooks/usePostContent';
import { useSmartTitle } from '@dailydotdev/shared/src/hooks/post/useSmartTitle';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useReaderInstallPromptGate } from '@dailydotdev/shared/src/hooks/useReaderInstallPromptGate';
import { useReaderModalEligibility } from '@dailydotdev/shared/src/components/post/reader/hooks/useReaderModalEligibility';
import usePoll from '@dailydotdev/shared/src/hooks/usePoll';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { getImageOriginRect } from '@dailydotdev/shared/src/components/modals/ImageModal';
import PostMetadata from '@dailydotdev/shared/src/components/cards/common/PostMetadata';
import YoutubeVideo from '@dailydotdev/shared/src/components/video/YoutubeVideo';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { ContentEmbeds } from '@dailydotdev/shared/src/components/contentEmbeds/ContentEmbeds';
import { YoutubeLinkEmbeds } from '@dailydotdev/shared/src/components/contentEmbeds/YoutubeLinkEmbeds';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { TextSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/TextSnapshotButton';
import { ParagraphSnapshotButtons } from '@dailydotdev/shared/src/features/snapshot/ParagraphSnapshotButtons';
import { SelectionSnapshotBar } from '@dailydotdev/shared/src/features/snapshot/SelectionSnapshotBar';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { getReadPostButtonIcon } from '@dailydotdev/shared/src/components/cards/common/ReadArticleButton';
import {
  EarthIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PostUpvotesCommentsCount } from '@dailydotdev/shared/src/components/post/PostUpvotesCommentsCount';
import { PostTagList } from '@dailydotdev/shared/src/components/post/tags/PostTagList';
import { PostSignupWidget } from '@dailydotdev/shared/src/components/post/PostSignupWidget';
import { PostAnsweredQuestions } from '@dailydotdev/shared/src/components/post/PostAnsweredQuestions';
import {
  CommunitySentiment,
  mapCommunitySentimentPost,
} from '@dailydotdev/shared/src/components/post/focus/CommunitySentiment';
import {
  combinedClicks,
  withSelectionGuard,
} from '@dailydotdev/shared/src/lib/click';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { UserShortInfo } from '@dailydotdev/shared/src/components/profile/UserShortInfo';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { FollowButton } from '@dailydotdev/shared/src/components/contentPreference/FollowButton';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { PostMenuOptions } from '@dailydotdev/shared/src/components/post/PostMenuOptions';
import { PostOptionButton } from '@dailydotdev/shared/src/features/posts/PostOptionButton';
import { PostContentShare } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import { BoostPostButton } from '@dailydotdev/shared/src/features/boost/BoostButton';
import { useShowBoostButton } from '@dailydotdev/shared/src/features/boost/useShowBoostButton';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import { hasSquadFeature } from '@dailydotdev/shared/src/features/squads/lib/features';
import { EmbeddedTweetPreview } from '@dailydotdev/shared/src/components/cards/socialTwitter/EmbeddedTweetPreview';
import PollOptions from '@dailydotdev/shared/src/components/cards/poll/PollOptions';
import { anchorNofollowRel } from '@dailydotdev/shared/src/lib/strings';
import HoverCard from '@dailydotdev/shared/src/components/cards/common/HoverCard';
import SourceEntityCard from '@dailydotdev/shared/src/components/cards/entity/SourceEntityCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { PostActions } from '@dailydotdev/shared/src/components/post/PostActions';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import { ActionBar } from './actionBar';
import { Discussion } from './discussion';
import { CollectionSources } from './collectionSources';
import { VideoSummary } from './videoSummary';
import { CollectionSourceStack } from '@dailydotdev/shared/src/components/post/collection/CollectionSourceStack';

/** The page's programmatic units, by where they sit in the column. */
export interface ColumnAds {
  /** Top leaderboard, first thing in the card from tablet up. */
  leading?: ReactNode;
  /** Between TLDR segments; receives the segment index. */
  inSummary?: (index: number) => ReactNode;
  aboveComments?: ReactNode;
  comments?: {
    interleaveEvery: number;
    renderInterleaved: (occurrence: number) => ReactNode;
  };
}

/** What a column renders as: the hybrid arm, or the redesign as it shipped. */
/**
 * The engagement row. The hybrid ships production's own row; the
 * redesign's floating bar stays here for a later experiment of its own.
 */
export enum ActionBarStyle {
  Classic = 'Production action row',
  Floating = 'Floating action bar',
}

export enum ColumnMode {
  Hybrid = 'hybrid',
  Redesign = 'redesign',
}

interface FocusColumnProps {
  post: Post;
  mode?: ColumnMode;
  ads?: ColumnAds;
  /** TLDR segments, split by the page at the production ad cadence. */
  summarySegments?: string[];
  /** The redesign's flat direct-sold card, under the article. */
  inlineAd?: ReactNode;
  hideCommentAd?: boolean;
  /** In the post modal: a clamped title, no Boost, no answered questions. */
  isModal?: boolean;
  actionBar?: ActionBarStyle;
}

const ArticleLink = ({
  href,
  onClick,
  children,
  ...props
}: ComponentProps<'a'> & {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <a
    href={href}
    title="Go to post"
    target="_blank"
    rel={anchorNofollowRel}
    {...(onClick ? combinedClicks<HTMLAnchorElement>(onClick) : {})}
    {...props}
  >
    {children}
  </a>
);

// Hybrid: the button sits in the header corner from laptop and under the
// date and read time below that. One is hidden, so a single button is ever
// in the accessibility tree. The redesign kept it under the TLDR.
const readPlacementClass = {
  hybrid: { top: 'hidden laptop:flex', inline: 'flex laptop:hidden' },
  redesign: { top: 'hidden', inline: 'flex' },
};

/**
 * The redesign's reading column (PostFocusCard before #6882). In the hybrid
 * it has no ad rail of its own: the classic right sidebar carries the rail,
 * the direct-sold card goes back there, and the cover follows the column's
 * width instead of the viewport's, since the column is narrower beside a
 * sidebar than it ever was alone.
 */
export const FocusColumn = ({
  post,
  mode = ColumnMode.Hybrid,
  ads,
  summarySegments,
  inlineAd,
  hideCommentAd,
  isModal = false,
  actionBar = ActionBarStyle.Classic,
}: FocusColumnProps): ReactElement => {
  const isHybrid = mode === ColumnMode.Hybrid;
  const isShared = post.type === PostType.Share && !!post.sharedPost;
  const article = (isShared ? post.sharedPost : post) as Post;
  const columnRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isCollection = article.type === PostType.Collection;
  const isPoll = post.type === PostType.Poll;
  const isXPost = post.type === PostType.SocialTwitter;
  const isSquadPost =
    post.type === PostType.Share || post.type === PostType.Freeform || isPoll;
  const author = isSquadPost ? post.author : undefined;
  const squadAttribution =
    post.source?.type === SourceType.Squad && (isShared || author)
      ? { label: isShared ? 'Shared via' : 'Posted in', source: post.source }
      : undefined;
  const isVideoType = isVideoPost(article);
  const isSharedTweet = isShared && isSocialTwitterPost(article);
  const isSharedVideo = isShared && isVideoType;
  const { title } = useSmartTitle(article);
  const commentary =
    isShared && post.title && post.title !== article.title ? post.title : null;
  const { onCopyPostLink, onReadArticle } = usePostContent({
    origin: Origin.ArticlePage,
    post,
  });
  const { openModal } = useLazyModal();
  const { onShowUpvoted } = useUpvoteQuery();
  const showBoostButton = useShowBoostButton({ post }) && !isModal;
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const { isReaderEnabled } = useReaderModalEligibility();
  const isReaderVariant = isReaderEnabled && article.type === PostType.Article;
  const { onVote, isCastingVote } = usePoll({ post });
  const communitySentimentData = article.communitySentiment
    ? mapCommunitySentimentPost(article.communitySentiment)
    : undefined;
  const focusCommentRef = useRef<() => void>(() => {});
  const discussionRef = useRef<HTMLDivElement>(null);
  const readHref = getReadArticleHref(post);
  const canReadArticle = !!readHref && !isInternalReadType(article) && !isPoll;
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVideoType || isVideoExpanded) {
      return undefined;
    }
    const onWindowBlur = () =>
      setTimeout(() => {
        const active = document.activeElement;
        if (
          active?.tagName === 'IFRAME' &&
          videoWrapperRef.current?.contains(active)
        ) {
          setIsVideoExpanded(true);
        }
      });
    window.addEventListener('blur', onWindowBlur);
    return () => window.removeEventListener('blur', onWindowBlur);
  }, [isVideoType, isVideoExpanded]);

  const handleReadClick = (event: React.MouseEvent) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };
  const scrollToComment = () => {
    discussionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    focusCommentRef.current();
  };

  const readCtaLabel = getReadPostButtonText(post);
  const canShowReadCta =
    canReadArticle &&
    !isSharedTweet &&
    !(isHybrid && isXPost) &&
    // A video plays in the page, so the hybrid drops "Watch video".
    !(isHybrid ? isVideoType : isSharedVideo);
  const readIcon = isReaderVariant ? (
    <EarthIcon size={IconSize.Small} />
  ) : (
    getReadPostButtonIcon(post)
  );
  const readLinkProps = {
    href: readHref,
    target: '_blank',
    rel: anchorNofollowRel,
    'aria-label': article.domain
      ? `${readCtaLabel} on ${article.domain}`
      : readCtaLabel,
    ...combinedClicks<HTMLAnchorElement>(handleReadClick),
  };
  const renderReadCta = (className: string): ReactNode =>
    canShowReadCta ? (
      <a
        {...readLinkProps}
        className={classNames(
          'h-8 w-fit shrink-0 items-center gap-1 rounded-10 bg-text-primary pl-3 pr-1.5 text-surface-invert',
          className,
        )}
      >
        <span className="font-bold typo-footnote">{readCtaLabel}</span>
        <span className="shrink-0">{readIcon}</span>
      </a>
    ) : null;
  const placementClass = readPlacementClass[mode];
  const inlineReadCta = renderReadCta(placementClass.inline);

  const segments =
    summarySegments ?? (article.summary ? [article.summary] : []);
  // The organic cadence can split the TLDR four times; in the hybrid the
  // button stays one paragraph from the title instead of under every unit.
  const isReadInSummary =
    isHybrid && segments.length > 1 && !article.contentHtml;
  const summarySnapshotButton = article.summary ? (
    <TextSnapshotButton
      filename={`daily-summary-${article.id}`}
      origin={Origin.PostSummary}
      post={article}
      text={article.summary}
    />
  ) : null;

  let summary: ReactNode = null;
  if (segments.length === 1 && isVideoType) {
    summary = (
      <VideoSummary summary={segments[0]} trailing={summarySnapshotButton} />
    );
  } else if (segments.length > 0) {
    summary = segments.map((segment, index, all) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        <p className="select-text break-words text-text-secondary typo-markdown">
          {segment}
          {index === all.length - 1 && summarySnapshotButton}
        </p>
        {index === 0 && isReadInSummary && inlineReadCta}
        {index < all.length - 1 && ads?.inSummary?.(index)}
      </React.Fragment>
    ));
  }

  const postBody = article.contentHtml ? (
    <div ref={bodyRef} className="flex flex-col gap-4">
      <Markdown content={article.contentHtml} className="break-words" />
      <ParagraphSnapshotButtons containerRef={bodyRef} post={article} />
      {article.type === PostType.Freeform && (
        <YoutubeLinkEmbeds contentHtml={article.contentHtml} />
      )}
      <ContentEmbeds embeds={article.contentEmbeds} variant="post" />
    </div>
  ) : (
    summary && <div className="flex flex-col gap-4">{summary}</div>
  );

  const coverImage =
    !isVideoType && article.image ? (
      <LazyImage
        eager
        className={classNames(
          'aspect-square w-full',
          isHybrid ? '@[36rem]/column:aspect-[25/13]' : 'tablet:aspect-[25/13]',
        )}
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        fetchPriority="high"
        imgAlt="Post cover image"
        imgSrc={article.image}
      />
    ) : null;
  const coverBoxClassName = classNames(
    'block w-28 shrink-0 overflow-hidden rounded-16 bg-background-subtle',
    isHybrid ? '@[36rem]/column:w-48' : 'tablet:w-48',
  );
  let coverElement: ReactNode = null;
  if (coverImage && canReadArticle) {
    coverElement = (
      <a
        href={readHref}
        target="_blank"
        rel={anchorNofollowRel}
        {...combinedClicks<HTMLAnchorElement>(handleReadClick)}
        aria-hidden
        tabIndex={-1}
        className={classNames(
          coverBoxClassName,
          'cursor-pointer transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-3 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none',
        )}
      >
        {coverImage}
      </a>
    );
  } else if (coverImage) {
    coverElement = (
      <button
        type="button"
        aria-label="View cover image"
        className={classNames(coverBoxClassName, 'cursor-zoom-in')}
        onClick={(event) =>
          openModal({
            type: LazyModal.ImageView,
            props: {
              src: article.image as string,
              alt: 'Post cover image',
              originRect: getImageOriginRect(event.currentTarget),
            },
          })
        }
      >
        {coverImage}
      </button>
    );
  }
  const isEmbed = isSharedTweet || isXPost;

  return (
    <div
      ref={columnRef}
      className={classNames(
        '@container/column flex w-full min-w-0 flex-col gap-4 px-4 py-6 tablet:px-6',
        // The profile and Squad pages pad their card 16px, then 24px from
        // tablet; the redesign's lone column went to 32px on laptops.
        !isHybrid && 'laptop:px-8',
      )}
    >
      <SelectionSnapshotBar containerRef={columnRef} post={article} />
      {ads?.leading}
      <div className="flex min-h-8 min-w-0 items-center gap-2">
        {author ? (
          <div className="flex min-w-0 shrink items-center gap-3">
            <Link href={author.permalink} passHref prefetch={false}>
              <UserShortInfo
                tag="a"
                href={author.permalink}
                user={author as unknown as UserShortProfile}
                imageSize={ProfileImageSize.Large}
                showDescription={false}
                transformUsername={() => null}
                className={{
                  container:
                    'min-w-0 shrink cursor-pointer !p-0 hover:bg-transparent',
                  textWrapper: 'min-w-0',
                }}
              />
            </Link>
            <FollowButton
              className="shrink-0"
              entityId={author.id}
              entityName={`@${author.username}`}
              type={ContentPreferenceType.User}
              status={author.contentPreference?.status}
              variant={ButtonVariant.Subtle}
              showSubscribe={false}
              buttonClassName="!h-7 !px-2"
            />
          </div>
        ) : (
          (isHybrid && isCollection && !!article.collectionSources?.length && (
            <CollectionSourceStack
              sources={article.collectionSources as SourceTooltip[]}
              totalSources={article.numCollectionSources ?? 0}
              size={ProfileImageSize.Large}
            />
          )) ||
          (article.source && (
            <SourceHeader source={article.source as SourceTooltip} />
          ))
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showBoostButton && (
            <BoostPostButton
              post={post}
              buttonProps={{ size: ButtonSize.Small }}
            />
          )}
          {renderReadCta(placementClass.top)}
          {/* Copy link lives in the floating action bar here. */}
          {isHybrid ? (
            <PostOptionButton
              post={post}
              origin={Origin.ArticlePage}
              size={ButtonSize.Medium}
              triggerClassName="[&_svg]:rotate-90"
            />
          ) : (
            <PostMenuOptions
              post={post}
              origin={Origin.ArticlePage}
              buttonSize={ButtonSize.Medium}
              menuTriggerClassName="[&_svg]:rotate-90"
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {squadAttribution && (
          <p className="flex items-center gap-1 text-text-tertiary typo-footnote">
            <span>{squadAttribution.label}</span>
            <HoverCard
              appendTo={globalThis?.document?.body}
              side="top"
              align="start"
              sideOffset={8}
              trigger={
                <span className="inline-flex items-center">
                  <Link
                    href={squadAttribution.source.permalink}
                    passHref
                    prefetch={false}
                  >
                    <a className="inline-flex items-center gap-1 font-bold text-text-link hover:underline">
                      {squadAttribution.source.image && (
                        <img
                          src={squadAttribution.source.image}
                          alt=""
                          aria-hidden
                          className="size-4 rounded-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {squadAttribution.source.name}
                      {hasSquadFeature(squadAttribution.source, 'verified') && (
                        <VerifiedSquadBadge />
                      )}
                    </a>
                  </Link>
                </span>
              }
            >
              <SourceEntityCard
                source={squadAttribution.source as SourceTooltip}
              />
            </HoverCard>
          </p>
        )}
        {isShared && !squadAttribution && (
          <p className="text-text-tertiary typo-footnote">Shared post</p>
        )}
        {!isShared && isCollection && (
          <p className="text-text-tertiary typo-footnote">Collection</p>
        )}
        {commentary && (
          <p className="whitespace-pre-line break-words text-text-primary typo-body">
            {commentary}
          </p>
        )}
        {isEmbed && (
          <div className="relative">
            <EmbeddedTweetPreview
              post={article}
              className={classNames(
                'w-full',
                isHybrid && !!readHref && '[&>div:first-child]:min-h-8',
              )}
              textClampClass=""
              bodyClassName="typo-markdown"
              showImage
              showXLogo={!isHybrid || !readHref}
            />
            {isHybrid && !!readHref && (
              <a
                href={readHref}
                target="_blank"
                rel={anchorNofollowRel}
                {...combinedClicks<HTMLAnchorElement>(() => onReadArticle())}
                aria-label="Read on X"
                className="absolute right-3 top-3 flex h-8 items-center gap-1 rounded-10 bg-text-primary pl-3 pr-2 text-surface-invert"
              >
                <span className="font-bold typo-footnote">Read on</span>
                <TwitterIcon size={IconSize.Size16} />
              </a>
            )}
          </div>
        )}
        {!isEmbed && (
          <div className="flex min-w-0 flex-row items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h1
                className={classNames(
                  'text-balance break-words font-bold text-text-primary typo-title3',
                  isModal && 'line-clamp-3',
                  isHybrid
                    ? '@[36rem]/column:typo-title1'
                    : 'tablet:typo-title1',
                )}
                data-testid="post-modal-title"
              >
                {canReadArticle ? (
                  <a
                    href={readHref}
                    target="_blank"
                    rel={anchorNofollowRel}
                    {...combinedClicks<HTMLAnchorElement>(
                      withSelectionGuard(handleReadClick),
                    )}
                    className="transition-colors hover:text-text-link"
                  >
                    {title}
                  </a>
                ) : (
                  title
                )}
              </h1>
              <PostMetadata
                className="flex-wrap !typo-callout tablet:flex-nowrap"
                createdAt={article.createdAt}
                domain={
                  !isVideoType &&
                  !!article.domain && (
                    <span className="min-w-0 break-words tablet:max-w-full tablet:shrink tablet:truncate">
                      From{' '}
                      <ArticleLink
                        className="hover:text-text-link hover:underline"
                        href={article.permalink}
                        onClick={() => onReadArticle()}
                        title={article.domain}
                      >
                        {article.domain}
                      </ArticleLink>
                    </span>
                  )
                }
                isVideoType={isVideoType}
                readTime={isPoll ? undefined : article.readTime}
              />
            </div>
            {coverElement}
          </div>
        )}
      </div>

      {isVideoType && (
        <div
          ref={videoWrapperRef}
          className={classNames(
            'shadow-1 w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3 transition-[max-width] duration-300 ease-out',
            isVideoExpanded ? 'max-w-full' : 'max-w-full mobileXL:max-w-[70%]',
          )}
        >
          <YoutubeVideo
            placeholderProps={{
              post: article,
              onWatchVideo: onReadArticle,
              // The cookie placeholder carries the classic page's 28px bottom
              // margin; inside this frame it reads as a gap under the player.
              className: isHybrid ? '!mb-0' : undefined,
            }}
            videoId={article.videoId ?? ''}
          />
        </div>
      )}

      {isPoll && (
        <PollOptions
          options={post.pollOptions ?? []}
          onClick={(optionId: string, text: string) => {
            if (!isCastingVote) {
              onVote(optionId, text);
            }
          }}
          userVote={post.userState?.pollOption?.id}
          numPollVotes={post.numPollVotes || 0}
          endsAt={post.endsAt}
        />
      )}

      {!isSharedTweet && (
        <div
          className={classNames(
            'flex flex-col gap-4',
            !isVideoType && 'flex-col-reverse tablet:flex-col',
          )}
        >
          {postBody && <div className="flex flex-col gap-4">{postBody}</div>}
          {!isReadInSummary && inlineReadCta}
        </div>
      )}

      {!isSquadPost && <PostTagList post={article} />}

      <PostSignupWidget post={article} inline />

      {communitySentimentData && (
        <CommunitySentiment data={communitySentimentData} />
      )}

      {isCollection && !isHybrid && <CollectionSources post={article} />}

      {inlineAd}

      <PostUpvotesCommentsCount
        post={post}
        onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
        className="!mb-0"
      />

      {isHybrid && actionBar === ActionBarStyle.Classic ? (
        <PostActions
          post={post}
          postQueryKey={getPostByIdKey(post.id)}
          onComment={scrollToComment}
          onCopyLinkClick={onCopyPostLink}
          origin={Origin.ArticlePage}
        />
      ) : (
        <ActionBar
          post={post}
          onComment={scrollToComment}
          onCopyLinkClick={onCopyPostLink}
          className="my-2"
        />
      )}

      <PostContentShare post={post} />

      {!isModal && <PostAnsweredQuestions post={article} />}

      {ads?.aboveComments}

      <div
        ref={discussionRef}
        className="scroll-mt-[calc(var(--safe-area-top,0px)+var(--shell-top,4rem))]"
      >
        <Discussion
          post={post}
          interleaveEvery={ads?.comments?.interleaveEvery}
          renderInterleaved={ads?.comments?.renderInterleaved}
          asShipped={!isHybrid}
          hideCommentAd={hideCommentAd}
          onRegisterFocusComment={(fn) => {
            focusCommentRef.current = fn;
          }}
        />
      </div>
    </div>
  );
};

/**
 * The redesign's compact source row (SourceStrip `compact` before #6882):
 * a 40px logo, the name in callout, a hover card and a subtle Follow.
 */
const SourceHeader = ({ source }: { source: SourceTooltip }): ReactElement => (
  <div className="flex min-w-0 shrink items-center gap-3">
    <HoverCard
      appendTo={globalThis?.document?.body}
      side="top"
      align="start"
      sideOffset={10}
      trigger={
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-10">
          <Link passHref href={source.permalink} prefetch={false}>
            <a
              className="shrink-0"
              aria-label={`Go to ${source.name}`}
              title={source.name}
            >
              <img
                src={source.image}
                alt=""
                className="size-10 rounded-full"
                loading="lazy"
                aria-hidden
              />
            </a>
          </Link>
          <Link passHref href={source.permalink} prefetch={false}>
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="min-w-0 shrink truncate hover:underline focus-visible:underline"
              title={source.name}
              bold
            >
              {source.name}
            </Typography>
          </Link>
        </div>
      }
    >
      <SourceEntityCard source={source} />
    </HoverCard>
    <FollowButton
      entityId={source.id ?? ''}
      entityName={source.name}
      type={ContentPreferenceType.Source}
      variant={ButtonVariant.Subtle}
      showSubscribe={false}
      buttonClassName="!h-7 !px-2"
    />
  </div>
);
