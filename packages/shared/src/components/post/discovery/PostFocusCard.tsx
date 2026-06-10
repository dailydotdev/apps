import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
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
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import Markdown from '../../Markdown';
import { ContentEmbeds } from '../../contentEmbeds/ContentEmbeds';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { getReadPostButtonIcon } from '../../cards/common/ReadArticleButton';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostTagList } from '../tags/PostTagList';
import { TruncateText } from '../../utilities';
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
import { PostDiscoveryActionBar } from './PostDiscoveryActionBar';
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
  const { onCopyPostLink, onReadArticle } = usePostContent({ origin, post });
  const { onShowUpvoted } = useUpvoteQuery();
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const focusCommentRef = useRef<() => void>(() => {});
  const discussionRef = useRef<HTMLDivElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const readHref = getReadArticleHref(post);
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

  // Rendered in the header on tablet+ (next to Follow) but moved below the
  // title on mobile, where the header row is too tight to hold both.
  const renderReadButton = (className: string): ReactElement | null =>
    readHref && !isInternalReadType(post) ? (
      <Button
        tag="a"
        href={readHref}
        target="_blank"
        rel="noopener"
        icon={getReadPostButtonIcon(post)}
        onClick={onReadArticle}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className={className}
      >
        {getReadPostButtonText(post)}
      </Button>
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
                <UserShortInfo
                  user={author as unknown as UserShortProfile}
                  imageSize={ProfileImageSize.Large}
                  showDescription={false}
                  transformUsername={() => null}
                  className={{
                    container: 'min-w-0 !p-0 hover:bg-transparent',
                    textWrapper: 'min-w-0',
                  }}
                />
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
            {renderReadButton('ml-auto hidden shrink-0 tablet:flex')}
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
            {/* Title and image are top-aligned columns. The below-title read
                button lives in the SAME column as the title (tight gap) so it
                sits right under it regardless of the image height; from tablet
                (656px) up the button moves to the top row and this one hides. */}
            <div className="flex min-w-0 flex-row items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <h1
                  className="line-clamp-3 break-words font-bold text-text-primary typo-title3 tablet:typo-title1"
                  data-testid="post-modal-title"
                >
                  {title}
                </h1>
                {renderReadButton('w-fit tablet:hidden')}
              </div>
              {!isVideoType && article.image && (
                <a
                  className="block h-fit w-24 shrink-0 overflow-hidden rounded-16 bg-background-subtle tablet:w-40"
                  href={readHref}
                  onClick={handleImageClick}
                  rel="noopener"
                  target="_blank"
                  title="Go to post"
                >
                  <LazyImage
                    eager
                    // Small square thumbnail below tablet; from tablet (656px)
                    // up it uses the original wide cover ratio (52% => 25/13).
                    className="aspect-square w-full tablet:aspect-[25/13]"
                    fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                    fetchPriority="high"
                    imgAlt="Post cover image"
                    imgSrc={article.image}
                  />
                </a>
              )}
            </div>
          </div>

          <PostDiscoveryActionBar
            post={post}
            origin={origin}
            onComment={scrollToComment}
            onCopyLinkClick={onCopyPostLink}
            onClose={onClose}
          />

          <PostMetadata
            className="!typo-callout"
            createdAt={article.createdAt}
            domain={
              !isVideoType &&
              article.domain &&
              article.domain.length > 0 && (
                <TruncateText>
                  From{' '}
                  <ArticleLink
                    className="hover:underline"
                    href={article.permalink}
                    onClick={onReadArticle}
                    title={article.domain}
                  >
                    {article.domain}
                  </ArticleLink>
                </TruncateText>
              )
            }
            isVideoType={isVideoType}
            readTime={article.readTime}
          />

          {isVideoType && (
            <div
              className={classNames(
                'shadow-1 w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3 transition-[max-width] duration-300 ease-out',
                isVideoPlaying ? 'max-w-full' : 'max-w-[70%]',
              )}
            >
              {isVideoPlaying ? (
                <YoutubeVideo
                  autoplay
                  placeholderProps={{
                    post: article,
                    onWatchVideo: onReadArticle,
                  }}
                  videoId={article.videoId ?? ''}
                />
              ) : (
                <button
                  type="button"
                  aria-label="Play video"
                  onClick={() => setIsVideoPlaying(true)}
                  className="group relative block w-full overflow-hidden rounded-16"
                >
                  <LazyImage
                    eager
                    fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                    imgAlt="Video thumbnail"
                    imgSrc={article.image}
                    ratio="56.25%"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-background-default text-text-primary shadow-2 transition-transform group-hover:scale-110">
                      <PlayIcon secondary size={IconSize.XLarge} />
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}

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

          <PostTagList post={article} />

          <PostUpvotesCommentsCount
            post={post}
            onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
            onCommentsClick={scrollToComment}
          />

          {isCollection && <CollectionSources post={article} />}

          {showCodeSnippets && (
            <div className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}>
              <PostCodeSnippets post={article} />
            </div>
          )}

          <PostSidebarAdWidget postId={post.id} variant="inline" />

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
