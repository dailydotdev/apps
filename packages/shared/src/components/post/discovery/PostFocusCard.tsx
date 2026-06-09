import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
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
import Markdown from '../../Markdown';
import { ContentEmbeds } from '../../contentEmbeds/ContentEmbeds';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PostHeaderActions } from '../PostHeaderActions';
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
            {isShared ? (
              readHref && (
                <Button
                  tag="a"
                  href={readHref}
                  target="_blank"
                  rel="noopener"
                  onClick={onReadArticle}
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  className="ml-auto shrink-0"
                >
                  {getReadPostButtonText(post)}
                </Button>
              )
            ) : (
              <PostHeaderActions
                buttonSize={ButtonSize.Small}
                className="ml-auto h-8 shrink-0 items-center"
                contextMenuId="post-discovery-header-actions"
                hideMenuOptions
                hideSubscribeAction
                onReadArticle={onReadArticle}
                post={post}
                readButtonVariant={ButtonVariant.Primary}
              />
            )}
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
            <div className="flex min-w-0 items-start gap-4">
              <h1
                className="min-w-0 flex-1 break-words font-bold text-text-primary typo-large-title"
                data-testid="post-modal-title"
              >
                {title}
              </h1>
              {!isVideoType && article.image && (
                <a
                  className="block h-fit w-28 shrink-0 overflow-hidden rounded-16 bg-background-subtle tablet:w-40"
                  href={readHref}
                  onClick={handleImageClick}
                  rel="noopener"
                  target="_blank"
                  title="Go to post"
                >
                  <LazyImage
                    eager
                    fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                    fetchPriority="high"
                    imgAlt="Post cover image"
                    imgSrc={article.image}
                    ratio="52%"
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
            <div className="shadow-1 flex min-w-0 flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3">
              <YoutubeVideo
                placeholderProps={{
                  post: article,
                  onWatchVideo: onReadArticle,
                }}
                videoId={article.videoId ?? ''}
              />
            </div>
          )}

          {article.contentHtml ? (
            <>
              <Markdown content={article.contentHtml} className="break-words" />
              <ContentEmbeds embeds={article.contentEmbeds} variant="post" />
            </>
          ) : (
            article.summary && (
              <p
                className="select-text break-words text-text-secondary typo-markdown"
                data-testid="tldr-container"
              >
                {article.summary}
              </p>
            )
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
              className="pt-2"
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
