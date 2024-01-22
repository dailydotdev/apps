import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import {
  CardImage,
  CardTitle,
  CardSpace,
  CardContainer,
  CardContent,
  CardTextContainer,
} from './Card';
import ActionButtons from './ActionButtons';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { PostCardHeader } from './PostCardHeader';
import { CollectionPillSources } from '../../post/collection';
import { cloudinary } from '../../../lib/image';
import { useTruncatedSummary } from '../../../hooks';

export const CollectionCard = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onShareClick,
    openNewTab,
    onReadArticleClick,
    onPostClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const image = usePostImage(post);
  const { title, summary } = useTruncatedSummary(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt, type: post.type }}
      linkProps={{
        title: post.title,
        onClick: () => onPostClick(post),
        href: post.commentsPermalink,
      }}
    >
      <CardContainer>
        <PostCardHeader
          post={post}
          onMenuClick={(event) => onMenuClick?.(event, post)}
        >
          <CollectionPillSources
            className={{
              main: classNames(!!post.collectionSources?.length && '-my-0.5'),
              avatar: 'group-hover:border-theme-bg-secondary',
            }}
            sources={post.collectionSources}
            totalSources={post.numCollectionSources}
            alwaysShowSources
          />
        </PostCardHeader>

        <CardContent>
          <div className="mb-4 mr-4 flex-1">
            <CardTitle
              className={classNames(
                generateTitleClamp({
                  hasImage: !!image,
                  hasHtmlContent: !!post.contentHtml,
                }),
              )}
            >
              {title}
            </CardTitle>

            {post.summary && (
              <CardTextContainer className="mt-4 text-theme-label-secondary typo-body">
                {summary}
              </CardTextContainer>
            )}
          </div>

          {image && (
            <CardImage
              alt="Post Cover image"
              src={image}
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
              className="my-2 object-cover mobileXXL:self-start mobileXXL:object-fill"
              loading="lazy"
            />
          )}
        </CardContent>
      </CardContainer>

      {!!post.image && <CardSpace />}
      <Container className="pointer-events-none">
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onDownvoteClick={onDownvoteClick}
          onCommentClick={onCommentClick}
          onShareClick={onShareClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
