import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  isInternalReadType,
  isVideoPost,
  PostType,
} from '../../../graphql/posts';
import type { SourceTooltip } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import usePostContent from '../../../hooks/usePostContent';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import { OpenLinkIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { getImageOriginRect } from '../../modals/ImageModal';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import Markdown from '../../Markdown';
import { ContentEmbeds } from '../../contentEmbeds/ContentEmbeds';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostTagList } from '../tags/PostTagList';
import { combinedClicks } from '../../../lib/click';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { SourceStrip } from '../reader/SourceStrip';
import Link from '../../utilities/Link';
import HoverCard from '../../cards/common/HoverCard';
import SourceEntityCard from '../../cards/entity/SourceEntityCard';
import { UserShortInfo } from '../../profile/UserShortInfo';
import { ProfileImageSize } from '../../ProfilePicture';
import type { UserShortProfile } from '../../../lib/user';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import { PostMenuOptions } from '../PostMenuOptions';
import { FocusCardActionBar } from './FocusCardActionBar';
import { PostDiscussionPanel } from './PostDiscussionPanel';
import { CollectionSources } from './CollectionSources';

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ '../PostCodeSnippets').then(
    (mod) => ({ default: mod.PostCodeSnippets }),
  ),
);

export type FocusCardLeftVariant = 'lean' | 'rich';

interface PostFocusCardProps {
  post: Post;
  origin: PostOrigin;
  leftVariant?: FocusCardLeftVariant;
  /** When opened in the post modal, lets the sticky action bar close it. */
  onClose?: () => void;
}

const ArticleLink = ({
  href,
  onClick,
  children,
  ...props
}: ComponentProps<'a'> & {
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const clickHandlers = onClick
    ? combinedClicks<HTMLAnchorElement>(onClick)
    : undefined;
  return (
    <a
      href={href}
      title="Go to post"
      target="_blank"
      rel="noopener"
      {...clickHandlers}
      {...props}
    >
      {children}
    </a>
  );
};

const SHOW_MORE_SUFFIX = '… Show more';

/**
 * Video TL;DR capped to four lines. When the text overflows we truncate it at a
 * word boundary and append an inline "… Show more" in the same font as the body
 * (only the link is recoloured) — a real ellipsis cut rather than a fade
 * overlay. The fitting prefix is measured with an off-screen clone so the
 * suffix always lands on the last visible line.
 */
const VideoSummary = ({ summary }: { summary: string }): ReactElement => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  // `null` => not measured yet or text fits; a string => the truncated prefix.
  const [truncated, setTruncated] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isExpanded) {
      setTruncated(null);
      return undefined;
    }

    const measure = () => {
      const clone = el.cloneNode(false) as HTMLElement;
      clone.classList.remove('line-clamp-4');
      Object.assign(clone.style, {
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        width: `${el.clientWidth}px`,
        height: 'auto',
        maxHeight: 'none',
      });
      el.parentElement?.appendChild(clone);

      clone.textContent = 'Mg';
      const maxHeight = clone.scrollHeight * 4 + 1;

      clone.textContent = summary;
      if (clone.scrollHeight <= maxHeight) {
        clone.remove();
        setTruncated(null);
        return;
      }

      let lo = 0;
      let hi = summary.length;
      let best = 0;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        clone.textContent = `${summary
          .slice(0, mid)
          .trimEnd()}${SHOW_MORE_SUFFIX}`;
        if (clone.scrollHeight <= maxHeight) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      clone.remove();

      // Snap back to the previous word boundary so we never cut mid-word.
      const prefix = summary.slice(0, best).trimEnd();
      const lastSpace = prefix.lastIndexOf(' ');
      const snapped = lastSpace > 0 ? prefix.slice(0, lastSpace) : prefix;
      // Never render a bare "… Show more" with no preview; fall back to the
      // CSS line-clamp instead.
      setTruncated(snapped || null);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [summary, isExpanded]);

  const isTruncated = !isExpanded && truncated !== null;

  return (
    <p
      ref={ref}
      className={classNames(
        'select-text break-words text-text-secondary typo-markdown',
        // Fallback clamp until the prefix is measured (and on SSR) so the full
        // text never flashes.
        truncated === null && !isExpanded && 'line-clamp-4',
      )}
      data-testid="tldr-container"
    >
      {isTruncated ? (
        <>
          {truncated}
          {'… '}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-text-link hover:underline"
          >
            Show more
          </button>
        </>
      ) : (
        summary
      )}
    </p>
  );
};

export const PostFocusCard = ({
  post,
  origin,
  leftVariant,
  onClose,
}: PostFocusCardProps): ReactElement => {
  // A shared post (someone reposting a post into a squad or onto their profile)
  // wraps an underlying post. Only true Share-type posts get the "Shared via"
  // treatment — auto-written articles/freeform posts render their own source.
  const isShared = post.type === PostType.Share && !!post.sharedPost;
  const article = (isShared ? post.sharedPost : post) as Post;
  // Shared into a squad → "Shared via {squad}"; shared to a profile → just
  // "Shared post" (we don't repeat the author's name).
  const sharedVia =
    isShared && post.source?.type === SourceType.Squad
      ? post.source
      : undefined;
  const isCollection = article.type === PostType.Collection;
  // Posts authored by a user (shared, freeform, welcome) lead with that
  // user, shown exactly like a comment author. Publication-sourced posts
  // (article/video/collection) keep their source strip.
  const author =
    post.type === PostType.Share ||
    post.type === PostType.Freeform ||
    post.type === PostType.Welcome
      ? post.author
      : undefined;
  const isVideoType = isVideoPost(article);
  const { title } = useSmartTitle(article);
  // A share post carries the user's own commentary in `post.title` (separate
  // from the shared article's title). Surface it so the text the user actually
  // wrote isn't dropped; skip it when it just mirrors the article's title.
  const commentary =
    isShared && post.title && post.title !== article.title ? post.title : null;
  const { onCopyPostLink, onReadArticle } = usePostContent({ origin, post });
  const { openModal } = useLazyModal();
  const { onShowUpvoted } = useUpvoteQuery();
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const focusCommentRef = useRef<() => void>(() => {});
  const discussionRef = useRef<HTMLDivElement>(null);
  // The video is a small floating preview on tablet/desktop and expands to the
  // full width on first interaction. We keep YouTube's native iframe (so the
  // first click plays with sound), so there's no React click handler to hook —
  // instead we detect the click landing inside the cross-origin iframe via the
  // window losing focus to it, then animate the container open.
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const readHref = getReadArticleHref(post);
  const canReadArticle = !!readHref && !isInternalReadType(post);

  useEffect(() => {
    if (!isVideoType || isVideoExpanded) {
      return undefined;
    }
    const onWindowBlur = () => {
      // activeElement updates after the blur dispatches, so defer the check.
      setTimeout(() => {
        const active = document.activeElement;
        if (
          active?.tagName === 'IFRAME' &&
          videoWrapperRef.current?.contains(active)
        ) {
          setIsVideoExpanded(true);
        }
      });
    };
    window.addEventListener('blur', onWindowBlur);
    return () => window.removeEventListener('blur', onWindowBlur);
  }, [isVideoType, isVideoExpanded]);

  // Honors the reader gate (open the reader inside daily.dev / install nudge)
  // before falling back to opening the external article.
  const handleReadClick = (event: React.MouseEvent) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };
  const scrollToDiscussion = () =>
    discussionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  const scrollToComment = () => {
    scrollToDiscussion();
    focusCommentRef.current();
  };

  // The read CTA sits above the TL;DR on mobile and after it on desktop, so it
  // is defined once and placed twice behind breakpoint-gated wrappers.
  const readCta = canReadArticle ? (
    <a
      href={readHref}
      target="_blank"
      rel="noopener"
      onClick={handleReadClick}
      aria-label={
        !isVideoType && article.domain
          ? `Read the full article on ${article.domain}`
          : 'Read the full article'
      }
      className="group flex w-fit items-center gap-2 rounded-12 bg-text-primary py-2 pl-4 pr-3 text-surface-invert transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-3 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none"
    >
      <span className="font-bold typo-callout">Read the full article</span>
      <OpenLinkIcon
        size={IconSize.Medium}
        className="shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </a>
  ) : null;

  return (
    <article
      className="flex w-full flex-col rounded-24 bg-background-default"
      data-testid="post-focus-card"
    >
      <div className="flex flex-col px-4 tablet:px-6 laptop:px-8">
        <div className="relative mx-auto flex w-full min-w-0 flex-col gap-4 py-6 laptop:max-w-[768px]">
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            {author ? (
              <div className="flex min-w-0 items-center gap-3">
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
                        'min-w-0 cursor-pointer !p-0 hover:bg-transparent',
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
              article.source && (
                <SourceStrip
                  compact
                  className="min-w-0 shrink"
                  followButtonVariant={ButtonVariant.Subtle}
                  source={article.source as SourceTooltip}
                />
              )
            )}
            <div className="ml-auto shrink-0 [&_svg]:rotate-90">
              <PostMenuOptions
                post={post}
                origin={origin}
                buttonSize={ButtonSize.Medium}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            {sharedVia && (
              <p className="flex items-center gap-1 text-text-tertiary typo-footnote">
                <span>Shared via</span>
                <HoverCard
                  appendTo={globalThis?.document?.body}
                  side="top"
                  align="start"
                  sideOffset={8}
                  trigger={
                    <span className="inline-flex items-center">
                      <Link
                        href={sharedVia.permalink}
                        passHref
                        prefetch={false}
                      >
                        <a className="inline-flex items-center gap-1 font-bold text-text-link hover:underline">
                          {sharedVia.image && (
                            <img
                              src={sharedVia.image}
                              alt=""
                              aria-hidden
                              className="size-4 rounded-full object-cover"
                              loading="lazy"
                            />
                          )}
                          {sharedVia.name}
                        </a>
                      </Link>
                    </span>
                  }
                >
                  <SourceEntityCard source={sharedVia as SourceTooltip} />
                </HoverCard>
              </p>
            )}
            {isShared && !sharedVia && (
              <p className="text-text-tertiary typo-footnote">Shared post</p>
            )}
            {!isShared && isCollection && (
              <p className="text-text-tertiary typo-footnote">Collection</p>
            )}
            {/* The sharer's own words, above the shared article they reference. */}
            {commentary && (
              <p className="whitespace-pre-line break-words font-bold text-text-primary typo-title3">
                {commentary}
              </p>
            )}
            {/* Title column and cover image sit side by side, top-aligned. The
                image keeps a fixed ratio (square on mobile/small tablet, the
                wide open-graph cover ratio from tablet up) so a short title
                can't squash it. The cover opens a lightbox rather than
                navigating away. */}
            <div className="flex min-w-0 flex-row items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <h1
                  className={classNames(
                    'break-words font-bold text-text-primary typo-title3 tablet:typo-title1',
                    // On the post page the reader came to read, so the title is
                    // always shown in full and the button flows below it; only
                    // the modal (a feed preview) clamps it.
                    onClose && 'line-clamp-3',
                  )}
                  data-testid="post-modal-title"
                >
                  {/* The title links to the post and turns the link colour on
                        hover; the read button below is the other entry point. */}
                  {canReadArticle ? (
                    <a
                      href={readHref}
                      target="_blank"
                      rel="noopener"
                      onClick={handleReadClick}
                      className="transition-colors hover:text-text-link"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h1>
              </div>
              {!isVideoType && article.image && (
                <button
                  type="button"
                  aria-label="View cover image"
                  className="block w-28 shrink-0 cursor-zoom-in overflow-hidden rounded-16 bg-background-subtle tablet:w-48"
                  onClick={(event) => {
                    openModal({
                      type: LazyModal.ImageView,
                      props: {
                        src: article.image as string,
                        alt: 'Post cover image',
                        originRect: getImageOriginRect(event.currentTarget),
                      },
                    });
                  }}
                >
                  <LazyImage
                    eager
                    // Square below tablet; from tablet up the wide open-graph
                    // cover ratio (52% => 25/13). Fixed either way so the image
                    // never distorts; object-cover crops to fit.
                    className="aspect-square w-full tablet:aspect-[25/13]"
                    fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                    fetchPriority="high"
                    imgAlt="Post cover image"
                    imgSrc={article.image}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Date, read time and source on a full-width line under the title
              row, so its gap to the TL;DR matches the rest of the column. */}
          <PostMetadata
            // Wrap to a second line on mobile so a long domain stays fully
            // visible (no ellipsis); single line from tablet up.
            className="flex-wrap !typo-callout tablet:flex-nowrap"
            createdAt={article.createdAt}
            domain={
              !isVideoType &&
              article.domain &&
              article.domain.length > 0 && (
                <span className="min-w-0 break-words tablet:max-w-full tablet:shrink tablet:truncate">
                  From{' '}
                  <ArticleLink
                    className="hover:text-text-link hover:underline"
                    href={article.permalink}
                    onClick={onReadArticle}
                    title={article.domain}
                  >
                    {article.domain}
                  </ArticleLink>
                </span>
              )
            }
            isVideoType={isVideoType}
            readTime={article.readTime}
          />

          {isVideoType && (
            <div
              ref={videoWrapperRef}
              className={classNames(
                'shadow-1 w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3 transition-[max-width] duration-300 ease-out',
                // Phones (below mobileXL, the mobileL bucket and smaller) and
                // the expanded state use the full width; tablet/desktop start
                // as a smaller floating preview until the user plays the video.
                isVideoExpanded
                  ? 'max-w-full'
                  : 'max-w-full mobileXL:max-w-[70%]',
              )}
            >
              {/* Embed YouTube's native player directly so the first click
                  plays inside the iframe with sound — no custom overlay or
                  muted autoplay. */}
              <YoutubeVideo
                placeholderProps={{
                  post: article,
                  onWatchVideo: onReadArticle,
                }}
                videoId={article.videoId ?? ''}
              />
            </div>
          )}

          {/* Mobile: the read CTA sits above the TL;DR. */}
          {readCta && <div className="tablet:hidden">{readCta}</div>}

          {article.contentHtml ? (
            <>
              <Markdown content={article.contentHtml} className="break-words" />
              <ContentEmbeds embeds={article.contentEmbeds} variant="post" />
            </>
          ) : (
            article.summary &&
            (isVideoType ? (
              <VideoSummary summary={article.summary} />
            ) : (
              <p
                className="select-text break-words text-text-secondary typo-markdown"
                data-testid="tldr-container"
              >
                {article.summary}
              </p>
            ))
          )}

          {/* Desktop: the read CTA sits after the summary. */}
          {readCta && <div className="hidden tablet:block">{readCta}</div>}

          <PostTagList post={article} />

          <PostUpvotesCommentsCount
            post={post}
            onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
            onCommentsClick={scrollToComment}
            // Spacing in this column is governed by its `gap-4`; drop the stats
            // row's own bottom margin so the gap above the action bar matches
            // the gap below it.
            className="!mb-0"
          />

          {isCollection && <CollectionSources post={article} />}

          {showCodeSnippets && (
            <div className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}>
              <PostCodeSnippets post={article} />
            </div>
          )}

          <PostSidebarAdWidget postId={post.id} variant="inline" />

          <FocusCardActionBar
            post={post}
            origin={origin}
            onComment={scrollToComment}
            onCopyLinkClick={onCopyPostLink}
            // Tighten the gap to the stats row above (the column's gap-4 alone
            // read as too large here).
            className="-mt-2"
          />

          <div ref={discussionRef} className="scroll-mt-16">
            <PostDiscussionPanel
              showMetaBar={false}
              showSortHeader
              onRegisterFocusComment={(fn) => {
                focusCommentRef.current = fn;
              }}
              post={post}
              origin={origin}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
