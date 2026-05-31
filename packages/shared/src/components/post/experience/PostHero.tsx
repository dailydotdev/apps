import classNames from 'classnames';
import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import {
  getReadArticleHref,
  getReadPostButtonText,
} from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { PostHeaderActions } from '../PostHeaderActions';
import PostSourceInfo from '../PostSourceInfo';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { PostTopicChips } from '../PostTopicChips';
import { getPostTopicTags } from '../anonymousPostExperience';

interface PostHeroProps {
  post: Post;
  title: string;
  isVideoType?: boolean;
  metadata?: ReactNode;
  onReadArticle?: () => void;
  onImageClick?: MouseEventHandler<HTMLAnchorElement>;
  onClose?: MouseEventHandler | React.KeyboardEventHandler;
  hideSubscribeAction?: boolean;
  inlineActions?: boolean;
}

export const PostHero = ({
  post,
  title,
  isVideoType,
  metadata,
  onReadArticle,
  onImageClick,
  onClose,
  hideSubscribeAction,
  inlineActions,
}: PostHeroProps): ReactElement => {
  const topics = getPostTopicTags(post, 4);
  const readHref = getReadArticleHref(post);
  const readText = getReadPostButtonText(post);

  return (
    <section className="relative grid min-h-[28rem] gap-6 overflow-hidden bg-surface-float p-4 tablet:p-6 laptop:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] laptop:p-8">
      <div className="flex min-w-0 flex-col justify-between gap-8">
        <div className="flex flex-col gap-6">
          <PostSourceInfo
            className="min-w-0"
            hideSubscribeAction={hideSubscribeAction}
            onClose={onClose}
            onReadArticle={onReadArticle}
            post={post}
          />
          <div className="flex flex-col gap-4">
            <div className="border-accent-cabbage-default/30 inline-flex w-fit rounded-10 border bg-accent-cabbage-subtlest px-2.5 py-1 text-accent-cabbage-default typo-caption1">
              Dev intelligence briefing
            </div>
            <h1
              className="max-w-[46rem] break-words font-bold typo-large-title laptop:typo-mega3"
              data-testid="post-modal-title"
            >
              {title}
            </h1>
            {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
            {metadata && (
              <div className="text-text-tertiary typo-callout">{metadata}</div>
            )}
            <PostTopicChips topics={topics} />
          </div>
        </div>

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
          {!!onReadArticle && readHref && (
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
          <PostHeaderActions
            buttonSize={ButtonSize.Large}
            className="justify-center tablet:justify-start"
            contextMenuId="post-experience-hero-actions"
            hideSubscribeAction={hideSubscribeAction}
            inlineActions={inlineActions}
            onClose={onClose}
            onReadArticle={onReadArticle}
            post={post}
          />
        </div>
      </div>

      <div
        className={classNames(
          'group relative min-h-[16rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2',
          isVideoType && 'flex items-center justify-center p-6',
        )}
      >
        {!isVideoType && (
          <a
            className="block size-full"
            href={readHref}
            onClick={onImageClick}
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
              ratio="68%"
            />
            <div className="from-background-default/80 opacity-90 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            <div className="bg-background-default/80 pointer-events-none absolute bottom-4 left-4 right-4 rounded-16 border border-border-subtlest-tertiary p-3 shadow-2 backdrop-blur">
              <p className="font-bold text-text-primary typo-callout">
                Open the original story
              </p>
              <p className="text-text-tertiary typo-footnote">
                daily.dev adds the context, feed preview, and community around
                it.
              </p>
            </div>
          </a>
        )}
        {isVideoType && (
          <div className="flex max-w-sm flex-col gap-3 text-center">
            <p className="font-bold text-text-primary typo-title2">
              Watch and discuss with developers
            </p>
            <p className="text-text-tertiary typo-callout">
              Jump into the video, then come back for comments, related posts,
              and live developer context.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
