import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  isShareLikePost,
  isVideoPost,
  PostType,
} from '../../../graphql/posts';
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
import Link from '../../utilities/Link';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
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
  // A shared post wraps an underlying post (article, video, collection…) in a
  // squad. Render that underlying post so every type uses the same card, and
  // surface the type/origin via a small eyebrow label above the title.
  const isShared = isShareLikePost(post) && !!post.sharedPost;
  const article = (isShared ? post.sharedPost : post) as Post;
  const sharedVia = isShared ? post.source : undefined;
  const isCollection = article.type === PostType.Collection;
  const isVideoType = isVideoPost(article);
  const { title } = useSmartTitle(article);
  const { onCopyPostLink, onReadArticle } = usePostContent({ origin, post });
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const focusCommentRef = useRef<() => void>(() => {});
  const readHref = getReadArticleHref(post);
  const hasToc = (article.toc?.length ?? 0) > 0;
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };

  return (
    <article
      className="flex w-full flex-col overflow-hidden rounded-24 bg-background-default"
      data-testid="post-focus-card"
    >
      <PostContainer className="relative laptop:border-r-0">
        <div className="relative mx-auto flex w-full min-w-0 flex-col gap-4 py-6 laptop:max-w-[768px]">
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            {article.source && (
              <SourceStrip
                compact
                className="min-w-0 shrink"
                followButtonVariant={ButtonVariant.Subtle}
                source={article.source as SourceTooltip}
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

          <div className="flex min-w-0 items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {(sharedVia || isCollection) && (
                <p className="text-text-tertiary typo-footnote">
                  {sharedVia ? (
                    <>
                      Shared via{' '}
                      <Link
                        href={sharedVia.permalink}
                        passHref
                        prefetch={false}
                      >
                        <a className="font-bold text-text-link hover:underline">
                          {sharedVia.name}
                        </a>
                      </Link>
                    </>
                  ) : (
                    'Collection'
                  )}
                </p>
              )}
              <h1
                className="min-w-0 break-words py-1 font-bold text-text-primary typo-large-title"
                data-testid="post-modal-title"
              >
                {title}
              </h1>
            </div>
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

          <PostDiscoveryActionBar
            post={post}
            origin={origin}
            onComment={() => focusCommentRef.current()}
            onCopyLinkClick={onCopyPostLink}
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

          {article.summary && (
            <p
              className="select-text break-words text-text-secondary typo-markdown"
              data-testid="tldr-container"
            >
              {article.summary}
            </p>
          )}

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

          <PostTagList post={article} />

          {hasToc && (
            <PostToc
              collapsible
              className="rounded-16 border border-border-subtlest-tertiary bg-transparent"
              post={article}
            />
          )}

          <aside className="w-full max-w-80 laptopXL:absolute laptopXL:left-full laptopXL:top-6 laptopXL:ml-6 laptopXL:w-80 laptopXL:max-w-none">
            <PostSidebarAdWidget
              postId={post.id}
              className={{
                container:
                  '!w-full !border-border-subtlest-tertiary !bg-transparent',
              }}
            />
          </aside>

          {showCodeSnippets && (
            <div className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}>
              <PostCodeSnippets post={article} />
            </div>
          )}

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
      </PostContainer>
    </article>
  );
};
