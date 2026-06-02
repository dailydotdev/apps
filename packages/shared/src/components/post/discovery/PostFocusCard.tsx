import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
  isVideoPost,
} from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import usePostContent from '../../../hooks/usePostContent';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { PostTagList } from '../tags/PostTagList';
import PostSourceInfo from '../PostSourceInfo';
import { PostMenuOptions } from '../PostMenuOptions';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PostActions } from '../PostActions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostDiscussionPanel } from './PostDiscussionPanel';

export type FocusCardLeftVariant = 'lean' | 'rich';

interface PostFocusCardProps {
  post: Post;
  origin: PostOrigin;
  leftVariant?: FocusCardLeftVariant;
}

export const PostFocusCard = ({
  post,
  origin,
}: PostFocusCardProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  const { title } = useSmartTitle(post);
  const { onCopyPostLink, onReadArticle } = usePostContent({ origin, post });
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const { onShowUpvoted } = useUpvoteQuery();
  const focusCommentRef = useRef<() => void>(() => {});
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };

  const readHref = getReadArticleHref(post);
  const readText = getReadPostButtonText(post);

  return (
    <article
      className="grid w-full overflow-hidden rounded-24 bg-background-default laptop:grid-cols-[minmax(0,1fr)_24rem]"
      data-testid="post-focus-card"
    >
      <div className="flex min-w-0 flex-col gap-6 p-4 tablet:p-6 laptop:p-8">
        <div className="flex min-w-0 flex-col gap-4">
          <PostSourceInfo
            className="min-w-0"
            hideSubscribeAction
            onReadArticle={onReadArticle}
            post={post}
            showActions={false}
          />
          <div className="flex min-w-0 flex-col gap-3">
            <h1
              className="break-words font-bold text-text-primary typo-large-title laptop:typo-mega3"
              data-testid="post-modal-title"
            >
              {title}
            </h1>
            <PostMetadata
              className="!mt-0 !typo-callout"
              createdAt={post.createdAt}
              isVideoType={isVideoType}
              readTime={post.readTime}
            />
            {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
          </div>

          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
            {!!readHref && (
              <Button
                className="w-full tablet:w-auto"
                href={readHref}
                onClick={() => onReadArticle()}
                size={ButtonSize.Large}
                tag="a"
                target="_blank"
                variant={ButtonVariant.Primary}
              >
                {readText}
              </Button>
            )}
            <PostMenuOptions
              buttonSize={ButtonSize.Large}
              origin={origin}
              post={post}
            />
          </div>
        </div>

        {isVideoType && post.videoId ? (
          <YoutubeVideo
            className="rounded-16 bg-background-subtle"
            placeholderProps={{ post, onWatchVideo: onReadArticle }}
            videoId={post.videoId}
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
              ratio="56%"
            />
          </a>
        )}

        <section className="flex min-w-0 flex-col gap-3">
          <p className="text-text-tertiary typo-caption1">TL;DR</p>
          {post.summary ? (
            <p
              className="select-text break-words text-text-secondary typo-markdown"
              data-testid="tldr-container"
            >
              {post.summary}
            </p>
          ) : (
            <p className="text-text-secondary typo-callout">
              Read the original post, then use the developer discussion and feed
              below to keep exploring related stories.
            </p>
          )}
        </section>

        <PostTagList post={post} />

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
