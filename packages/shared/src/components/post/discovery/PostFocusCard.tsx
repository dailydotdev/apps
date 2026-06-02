import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import { getReadArticleHref, isVideoPost } from '../../../graphql/posts';
import type { SourceTooltip } from '../../../graphql/sources';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import usePostContent from '../../../hooks/usePostContent';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PostHeaderActions } from '../PostHeaderActions';
import { PostContainer } from '../common';
import { PostTagList } from '../tags/PostTagList';
import PostToc from '../../widgets/PostToc';
import { TruncateText } from '../../utilities';
import { combinedClicks } from '../../../lib/click';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { SourceStrip } from '../reader/SourceStrip';
import { PostDiscoveryActionBar } from './PostDiscoveryActionBar';
import { PostDiscussionPanel } from './PostDiscussionPanel';

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
}: PostFocusCardProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  const { title } = useSmartTitle(post);
  const { onCopyPostLink, onReadArticle } = usePostContent({ origin, post });
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const focusCommentRef = useRef<() => void>(() => {});
  const readHref = getReadArticleHref(post);
  const hasToc = (post.toc?.length ?? 0) > 0;
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };

  return (
    <article
      className="flex w-full flex-col overflow-hidden rounded-24 bg-background-default laptop:flex-row laptop:justify-center"
      data-testid="post-focus-card"
    >
      {/* Ghost column mirroring the comments rail width so the content column
          stays optically centered in the page rather than the content+comments
          pair being centered together. */}
      <div
        aria-hidden
        className="hidden shrink-0 laptop:block laptop:w-[400px]"
      />
      <PostContainer className="relative laptop:shrink laptop:grow-0 laptop:basis-[832px] laptop:border-r-0">
        <div className="flex min-w-0 flex-col gap-4 py-6 laptop:max-w-[768px] laptop:py-6">
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            {post.source && (
              <SourceStrip
                compact
                className="min-w-0 shrink"
                followButtonVariant={ButtonVariant.Subtle}
                source={post.source as SourceTooltip}
              />
            )}
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
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <h1
              className="break-words font-bold text-text-primary typo-large-title"
              data-testid="post-modal-title"
            >
              {title}
            </h1>
          </div>

          <PostDiscoveryActionBar
            post={post}
            origin={origin}
            onComment={() => focusCommentRef.current()}
            onCopyLinkClick={onCopyPostLink}
          />

          {!isVideoType && post.summary && (
            <p
              className="select-text break-words text-text-secondary typo-markdown"
              data-testid="tldr-container"
            >
              {post.summary}
            </p>
          )}

          {isVideoType ? (
            <div className="shadow-1 flex min-w-0 flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3">
              <YoutubeVideo
                placeholderProps={{ post, onWatchVideo: onReadArticle }}
                videoId={post.videoId ?? ''}
              />
              {post.summary && (
                <p
                  className="select-text break-words px-1 pb-1 text-text-secondary typo-markdown"
                  data-testid="tldr-container"
                >
                  {post.summary}
                </p>
              )}
            </div>
          ) : (
            <a
              className="block overflow-hidden rounded-16 bg-background-subtle"
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
                imgSrc={post.image}
                ratio="48%"
              />
            </a>
          )}

          <PostMetadata
            className="!typo-callout"
            createdAt={post.createdAt}
            domain={
              !isVideoType &&
              post.domain &&
              post.domain.length > 0 && (
                <TruncateText>
                  From{' '}
                  <ArticleLink
                    className="hover:underline"
                    href={post.permalink}
                    onClick={onReadArticle}
                    title={post.domain}
                  >
                    {post.domain}
                  </ArticleLink>
                </TruncateText>
              )
            }
            isVideoType={isVideoType}
            readTime={post.readTime}
          />

          <PostTagList post={post} />

          {hasToc && (
            <PostToc
              collapsible
              className="rounded-16 border border-border-subtlest-tertiary bg-surface-float"
              post={post}
            />
          )}

          {showCodeSnippets && (
            <div className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}>
              <PostCodeSnippets post={post} />
            </div>
          )}
        </div>
      </PostContainer>

      <aside className="flex min-h-0 min-w-0 shrink-0 flex-col border-t border-border-subtlest-tertiary bg-background-subtle laptop:sticky laptop:top-16 laptop:h-[calc(100vh-4rem)] laptop:max-h-[calc(100vh-4rem)] laptop:w-[400px] laptop:border-t-0 laptop:bg-background-default">
        <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2 laptop:h-full">
          <PostDiscussionPanel
            className="h-full p-4"
            showMetaBar={false}
            showSortHeader
            onRegisterFocusComment={(fn) => {
              focusCommentRef.current = fn;
            }}
            post={post}
            origin={origin}
          />
        </div>
      </aside>
    </article>
  );
};
