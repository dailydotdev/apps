import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container, getGroupedHoverContainer } from '../common/common';
import {
  CardHeader,
  CardSpace,
  CardTextContainer,
  getPostClassNames,
} from '../common/Card';
import FeedItemContainer from '../common/FeedItemContainer';
import CardOverlay from '../common/CardOverlay';
import ActionButtons from '../common/ActionButtons';
import { TwitterIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { ReadArticleButton } from '../common/ReadArticleButton';
import { getReadPostButtonText } from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/Button';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { useFeedPreviewMode } from '../../../hooks';

const HoverActions = getGroupedHoverContainer('span');

export const TweetGrid = forwardRef(function TweetGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onCopyLinkClick,
    openNewTab,
    onReadArticleClick,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  const { pinnedAt, trending } = post;
  const isFeedPreview = useFeedPreviewMode();

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className: getPostClassNames(post, classNames(className), 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />

      <div className="flex flex-1 flex-col">
        {/* Card header: X source icon + actions */}
        <CardTextContainer>
          <CardHeader>
            <div className="flex size-7 items-center justify-center rounded-full bg-white">
              <TwitterIcon className="text-black" size={IconSize.Size16} />
            </div>
            <HoverActions
              className="ml-auto flex flex-row"
              data-testid="cardHeaderActions"
            >
              {!isFeedPreview && (
                <>
                  <ReadArticleButton
                    content={getReadPostButtonText(post)}
                    className="mr-2"
                    variant={ButtonVariant.Primary}
                    href={post.permalink}
                    onClick={onReadArticleClick}
                    openNewTab={openNewTab}
                  />
                  <PostOptionButton post={post} />
                </>
              )}
            </HoverActions>
          </CardHeader>
        </CardTextContainer>

        {/* Tweet content */}
        <div className="mx-4 mt-1 flex items-center gap-2">
          <img
            src={post.author?.image ?? post.source?.image}
            alt={`${post.author?.name ?? post.source?.name} profile`}
            className="h-8 w-8 rounded-full bg-background-default object-cover"
            loading="lazy"
          />
          <div className="leading-tight">
            <p
              className="font-bold text-text-primary"
              style={{ fontSize: '15px' }}
            >
              {post.author?.name ?? post.source?.name}
            </p>
            <p className="text-xs text-text-quaternary">
              {post.author?.username
                ? `@${post.author.username}`
                : post.source?.handle
                  ? `@${post.source.handle}`
                  : ''}
            </p>
          </div>
        </div>

        {post.title && (
          <p
            className="mx-4 mt-3 line-clamp-2 font-bold leading-snug text-text-primary"
            style={{ fontSize: '15px' }}
          >
            {post.title}
          </p>
        )}

        {post.summary && (
          <p
            className="mx-4 mt-2 line-clamp-3 text-text-secondary"
            style={{ fontSize: '15px', lineHeight: '20px' }}
          >
            {post.summary}
          </p>
        )}

        <div className="mx-4 mt-3 flex items-center justify-end">
          <span className="z-1 inline-flex items-center gap-1 text-text-quaternary typo-caption1 transition-colors hover:text-text-secondary">
            <span>Open on</span>
            <TwitterIcon size={IconSize.XXSmall} />
          </span>
        </div>

        <Container>
          <CardSpace />
          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
