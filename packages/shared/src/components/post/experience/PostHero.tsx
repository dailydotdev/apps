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
    <section className="relative overflow-hidden bg-background-subtle px-4 py-6 tablet:px-6 laptop:px-8 laptop:py-10">
      <div className="mx-auto grid w-full max-w-[64rem] gap-8 laptop:grid-cols-[minmax(0,1fr)_22rem] laptop:items-center">
        <div className="flex min-w-0 flex-col gap-6">
          <PostSourceInfo
            className="min-w-0"
            hideSubscribeAction={hideSubscribeAction}
            onClose={onClose}
            onReadArticle={onReadArticle}
            post={post}
          />
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit rounded-10 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-1 text-text-tertiary typo-caption1">
              External article discussed on daily.dev
            </div>
            <h1
              className="max-w-[48rem] break-words font-bold typo-large-title laptop:typo-mega2"
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
            'shadow-1 group relative min-h-[14rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default',
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
              <div className="from-background-default/90 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-4 pt-16">
                <p className="font-bold text-text-primary typo-callout">
                  Read the original article
                </p>
                <p className="text-text-tertiary typo-footnote">
                  Then see what the developer community thinks about it.
                </p>
              </div>
            </a>
          )}
          {isVideoType && (
            <div className="flex max-w-sm flex-col gap-3 text-center">
              <p className="font-bold text-text-primary typo-title2">
                Watch the original video
              </p>
              <p className="text-text-tertiary typo-callout">
                Then continue into the developer discussion below.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
