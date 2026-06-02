import dynamic from 'next/dynamic';
import type { ComponentProps, ReactElement } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import usePostContent from '../../../hooks/usePostContent';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { PostActions } from '../PostActions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostHero } from '../experience/PostHero';
import { PostInsightPanel } from '../experience/PostInsightPanel';
import { TruncateText } from '../../utilities';
import { combinedClicks } from '../../../lib/click';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
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
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };

  return (
    <article
      className="grid w-full overflow-hidden rounded-24 bg-background-default laptop:grid-cols-[minmax(0,1fr)_24rem]"
      data-testid="post-focus-card"
    >
      <div className="flex min-w-0 flex-col">
        <PostHero
          hideSubscribeAction
          inlineActions
          isVideoType={isVideoType}
          metadata={
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
          }
          onImageClick={handleImageClick}
          onReadArticle={onReadArticle}
          post={post}
          title={title}
        />

        <div className="flex min-w-0 flex-col gap-6 border-t border-border-subtlest-tertiary p-4 tablet:p-6 laptop:p-8">
          {isVideoType && (
            <YoutubeVideo
              className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3"
              placeholderProps={{ post, onWatchVideo: onReadArticle }}
              videoId={post.videoId ?? ''}
            />
          )}

          <PostInsightPanel post={post}>
            {showCodeSnippets && (
              <PostCodeSnippets
                className={leftVariant === 'lean' ? 'mb-4' : 'mb-6'}
                post={post}
              />
            )}
          </PostInsightPanel>

          <section className="flex min-w-0 flex-col gap-3 border-t border-border-subtlest-tertiary pt-4">
            <PostUpvotesCommentsCount
              post={post}
              onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
            />
            <PostActions
              post={post}
              postQueryKey={['post', post.id]}
              onComment={() => focusCommentRef.current()}
              onCopyLinkClick={onCopyPostLink}
              origin={origin}
            />
          </section>
        </div>
      </div>

      <aside className="flex min-h-0 min-w-0 flex-col border-t border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6 laptop:sticky laptop:top-16 laptop:max-h-[calc(100vh-8rem)] laptop:border-l laptop:border-t-0 laptop:p-4">
        <PostDiscussionPanel
          onRegisterFocusComment={(fn) => {
            focusCommentRef.current = fn;
          }}
          post={post}
          origin={origin}
        />
      </aside>
    </article>
  );
};
