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
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { ButtonSize } from '../../buttons/Button';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { PostHeaderActions } from '../PostHeaderActions';
import { PostActions } from '../PostActions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostContainer } from '../common';
import { PostTagList } from '../tags/PostTagList';
import PostToc from '../../widgets/PostToc';
import { TruncateText } from '../../utilities';
import { combinedClicks } from '../../../lib/click';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { SourceStrip } from '../reader/SourceStrip';
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
  const { onShowUpvoted } = useUpvoteQuery();
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
      className="flex w-full flex-col overflow-hidden rounded-24 bg-background-default laptop:flex-row"
      data-testid="post-focus-card"
    >
      <PostContainer className="relative laptop:border-r-0">
        <div className="flex min-w-0 flex-col gap-6 py-6 laptop:py-8">
          <div className="flex min-w-0 items-start gap-3">
            {post.source && (
              <SourceStrip
                className="min-w-0 flex-1"
                source={post.source as SourceTooltip}
              />
            )}
            <PostHeaderActions
              buttonSize={ButtonSize.Large}
              className="ml-auto shrink-0"
              contextMenuId="post-discovery-header-actions"
              hideSubscribeAction
              inlineActions
              onReadArticle={onReadArticle}
              post={post}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <h1
              className="break-words font-bold text-text-primary typo-large-title laptop:typo-mega2"
              data-testid="post-modal-title"
            >
              {title}
            </h1>
            {post.summary && (
              <p
                className="select-text break-words text-text-secondary typo-title3"
                data-testid="tldr-container"
              >
                {post.summary}
              </p>
            )}
            {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
            <PostTagList post={post} />
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
          </div>

          {isVideoType ? (
            <YoutubeVideo
              className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3"
              placeholderProps={{ post, onWatchVideo: onReadArticle }}
              videoId={post.videoId ?? ''}
            />
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

          {hasToc && <PostToc post={post} />}

          {showCodeSnippets && (
            <div className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}>
              <PostCodeSnippets post={post} />
            </div>
          )}

          <PostUpvotesCommentsCount
            post={post}
            onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
          />
        </div>
      </PostContainer>

      <aside className="flex min-h-0 min-w-0 shrink-0 flex-col border-t border-border-subtlest-tertiary bg-background-subtle laptop:sticky laptop:top-16 laptop:h-[calc(100vh-4rem)] laptop:max-h-[calc(100vh-4rem)] laptop:w-[26rem] laptop:border-t-0 laptop:bg-background-default">
        <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2 laptop:h-full">
          <PostDiscussionPanel
            actionBar={
              <PostActions
                borderless
                post={post}
                postQueryKey={['post', post.id]}
                onComment={() => focusCommentRef.current()}
                onCopyLinkClick={onCopyPostLink}
                origin={origin}
              />
            }
            className="h-full p-4"
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
