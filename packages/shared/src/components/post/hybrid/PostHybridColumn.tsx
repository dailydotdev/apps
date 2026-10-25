import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
  isInternalReadType,
  isSocialTwitterPost,
  isVideoPost,
  PostType,
} from '../../../graphql/posts';
import type { SourceTooltip } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import usePoll from '../../../hooks/usePoll';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { Origin } from '../../../lib/log';
import { combinedClicks, withSelectionGuard } from '../../../lib/click';
import { anchorNofollowRel } from '../../../lib/strings';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import type { UserShortProfile } from '../../../lib/user';
import { useReaderModalEligibility } from '../reader/hooks/useReaderModalEligibility';
import { LazyModal } from '../../modals/common/types';
import { getImageOriginRect } from '../../modals/ImageModal';
import PostMetadata from '../../cards/common/PostMetadata';
import { getReadPostButtonIcon } from '../../cards/common/ReadArticleButton';
import { EmbeddedTweetPreview } from '../../cards/socialTwitter/EmbeddedTweetPreview';
import PollOptions from '../../cards/poll/PollOptions';
import HoverCard from '../../cards/common/HoverCard';
import SourceEntityCard from '../../cards/entity/SourceEntityCard';
import YoutubeVideo from '../../video/YoutubeVideo';
import Markdown from '../../Markdown';
import { ContentEmbeds } from '../../contentEmbeds/ContentEmbeds';
import { YoutubeLinkEmbeds } from '../../contentEmbeds/YoutubeLinkEmbeds';
import { LazyImage } from '../../LazyImage';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EarthIcon, TwitterIcon } from '../../icons';
import { IconSize } from '../../Icon';
import Link from '../../utilities/Link';
import { UserShortInfo } from '../../profile/UserShortInfo';
import { ProfileImageSize } from '../../ProfilePicture';
import { FollowButton } from '../../contentPreference/FollowButton';
import PostToc from '../../widgets/PostToc';
import { TextSnapshotButton } from '../../../features/snapshot/TextSnapshotButton';
import { ParagraphSnapshotButtons } from '../../../features/snapshot/ParagraphSnapshotButtons';
import { SelectionSnapshotBar } from '../../../features/snapshot/SelectionSnapshotBar';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { BoostPostButton } from '../../../features/boost/BoostButton';
import { useShowBoostButton } from '../../../features/boost/useShowBoostButton';
import { VerifiedSquadBadge } from '../../../features/squads/components/VerifiedSquad';
import { hasSquadFeature } from '../../../features/squads/lib/features';
import { PostTagList } from '../tags/PostTagList';
import { PostSignupWidget } from '../PostSignupWidget';
import { PostAnsweredQuestions } from '../PostAnsweredQuestions';
import { PostExcoPlayerWidget } from '../PostExcoPlayerWidget';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { CollectionSourceStack } from '../collection/CollectionSourceStack';
import {
  CommunitySentiment,
  mapCommunitySentimentPost,
} from '../focus/CommunitySentiment';
import { PostHybridDiscussion } from './PostHybridDiscussion';
import { PostHybridSourceHeader } from './PostHybridSourceHeader';
import { PostHybridVideoSummary } from './PostHybridVideoSummary';

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ '../PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

/**
 * The page's programmatic units, by where they sit in the column. Only the
 * webapp post page passes them; the modal never carries ad markup.
 */
export interface PostHybridAds {
  /** Top leaderboard, first thing in the card. */
  contentLeading?: ReactNode;
  /** The TLDR split at the page's ad cadence. */
  summarySegments?: string[];
  /** Between TLDR segments; receives the segment index. */
  renderSummaryAd?: (index: number) => ReactNode;
  aboveComments?: ReactNode;
  commentAds?: {
    interleaveEvery: number;
    renderInterleaved: (occurrence: number) => ReactNode;
  };
}

export interface PostHybridColumnProps {
  post: Post;
  origin: PostOrigin;
  ads?: PostHybridAds;
  /** In the post modal: a clamped title, no Boost, no answered questions. */
  isModal?: boolean;
  onClose?: () => void;
  shouldOnboardAuthor?: boolean;
  onReadArticle: () => void;
  onCopyPostLink: () => void;
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

/**
 * The post_page_hybrid reading column: the redesign's title, cover and
 * discussion beside the classic right sidebar. Its cover and title follow the
 * column's width rather than the viewport's, since the column is narrower
 * beside a sidebar than the redesign's lone column ever was.
 */
export function PostHybridColumn({
  post,
  origin,
  ads,
  isModal = false,
  onClose,
  shouldOnboardAuthor,
  onReadArticle,
  onCopyPostLink,
}: PostHybridColumnProps): ReactElement {
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
  const isEmbed = isSharedTweet || isXPost;
  const { title } = useSmartTitle(article);
  const commentary =
    isShared && post.title && post.title !== article.title ? post.title : null;
  const { openModal } = useLazyModal();
  const showBoostButton = useShowBoostButton({ post }) && !isModal;
  const { onReadClick: onReaderInstallGateClick } = useReaderInstallPromptGate(
    post,
    { onCloseParent: onClose },
  );
  const { isReaderEnabled } = useReaderModalEligibility();
  const isReaderVariant = isReaderEnabled && article.type === PostType.Article;
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const { onVote, isCastingVote } = usePoll({ post });
  const communitySentimentData = article.communitySentiment
    ? mapCommunitySentimentPost(article.communitySentiment)
    : undefined;
  const readHref = getReadArticleHref(post);
  const canReadArticle = !!readHref && !isInternalReadType(article) && !isPoll;
  const hasToc = (article.toc?.length ?? 0) > 0;
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  // YouTube's iframe swallows the click, so the frame grows once focus moves
  // into it.
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

  const readCtaLabel = getReadPostButtonText(post);
  // X posts read from the embed's corner, and a video plays in the page.
  const canShowReadCta =
    canReadArticle && !isEmbed && !isVideoType && !!readHref;
  const getReadCta = (className: string): ReactNode =>
    canShowReadCta ? (
      <a
        href={readHref}
        target="_blank"
        rel={anchorNofollowRel}
        aria-label={
          article.domain ? `${readCtaLabel} on ${article.domain}` : readCtaLabel
        }
        {...combinedClicks<HTMLAnchorElement>(handleReadClick)}
        className={classNames(
          'h-8 w-fit shrink-0 items-center gap-1 rounded-10 bg-text-primary pl-3 pr-1.5 text-surface-invert',
          className,
        )}
      >
        <span className="font-bold typo-footnote">{readCtaLabel}</span>
        <span className="shrink-0">
          {isReaderVariant ? (
            <EarthIcon size={IconSize.Small} />
          ) : (
            getReadPostButtonIcon(post)
          )}
        </span>
      </a>
    ) : null;
  // One of the two is hidden at every width, so a single button is ever in
  // the accessibility tree.
  const inlineReadCta = getReadCta('flex laptop:hidden');

  const segments =
    ads?.summarySegments ?? (article.summary ? [article.summary] : []);
  // With the TLDR split by ads, the button stays one paragraph from the title
  // instead of under the last unit.
  const isReadInSummary = segments.length > 1 && !article.contentHtml;
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
      <PostHybridVideoSummary
        summary={segments[0]}
        trailing={summarySnapshotButton}
      />
    );
  } else if (segments.length > 0) {
    summary = segments.map((segment, index, all) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        <p
          className="select-text break-words text-text-secondary typo-markdown"
          data-testid={index === 0 ? 'tldr-container' : undefined}
        >
          {segment}
          {index === all.length - 1 && summarySnapshotButton}
        </p>
        {index === 0 && isReadInSummary && inlineReadCta}
        {index < all.length - 1 && ads?.renderSummaryAd?.(index)}
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
        className="aspect-square w-full @[36rem]/column:aspect-[25/13]"
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        fetchPriority="high"
        imgAlt="Post cover image"
        imgSrc={article.image}
      />
    ) : null;
  const coverBoxClassName =
    'block w-28 shrink-0 overflow-hidden rounded-16 bg-background-subtle @[36rem]/column:w-48';
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

  let headerSource: ReactNode = null;
  if (author) {
    headerSource = (
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
    );
  } else if (isCollection && !!article.collectionSources?.length) {
    headerSource = (
      <CollectionSourceStack
        sources={article.collectionSources as SourceTooltip[]}
        totalSources={article.numCollectionSources ?? 0}
        size={ProfileImageSize.Large}
      />
    );
  } else if (article.source) {
    headerSource = (
      <PostHybridSourceHeader source={article.source as SourceTooltip} />
    );
  }

  return (
    <div
      ref={columnRef}
      className="flex w-full min-w-0 flex-col gap-4 px-4 py-6 @container/column tablet:px-6"
      data-testid="post-hybrid-column"
    >
      <SelectionSnapshotBar containerRef={columnRef} post={article} />
      {ads?.contentLeading}
      <div className="flex min-h-8 min-w-0 items-center gap-2">
        {headerSource}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showBoostButton && (
            <BoostPostButton
              post={post}
              buttonProps={{ size: ButtonSize.Small }}
            />
          )}
          {getReadCta('hidden laptop:flex')}
          <PostOptionButton
            post={post}
            origin={origin}
            size={ButtonSize.Medium}
            triggerClassName="[&_svg]:rotate-90"
          />
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
                !!readHref && '[&>div:first-child]:min-h-8',
              )}
              textClampClass=""
              bodyClassName="typo-markdown"
              showImage
              showXLogo={!readHref}
            />
            {!!readHref && (
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
                  'text-balance break-words font-bold text-text-primary typo-title3 @[36rem]/column:typo-title1',
                  isModal && 'line-clamp-3',
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
                        onClick={handleReadClick}
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
              {article.clickbaitTitleDetected && (
                <PostClickbaitShield post={article} />
              )}
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
              className: '!mb-0',
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
          {postBody}
          {!isReadInSummary && inlineReadCta}
        </div>
      )}

      {hasToc && (
        <PostToc post={article} collapsible className="flex laptop:hidden" />
      )}

      {!isSquadPost && <PostTagList post={article} />}

      {showCodeSnippets && <PostCodeSnippets post={article} />}

      <PostSignupWidget post={article} inline />

      {communitySentimentData && (
        <CommunitySentiment data={communitySentimentData} />
      )}

      <PostExcoPlayerWidget post={post} placement="inline" />

      <PostHybridDiscussion
        post={post}
        origin={origin}
        shouldOnboardAuthor={shouldOnboardAuthor}
        onCopyLinkClick={onCopyPostLink}
        hideInternalAd={!!ads?.commentAds}
        interleaveEvery={ads?.commentAds?.interleaveEvery}
        renderInterleaved={ads?.commentAds?.renderInterleaved}
        beforeDiscussion={
          <>
            {!isModal && <PostAnsweredQuestions post={article} />}
            {ads?.aboveComments}
          </>
        }
      />
    </div>
  );
}
