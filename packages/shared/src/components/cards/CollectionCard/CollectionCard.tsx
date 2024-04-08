import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import FeedItemContainer from '../FeedItemContainer';
import { CollectionCardHeader } from './CollectionCardHeader';
import { getPostClassNames, FreeformCardTitle, CardSpace } from '../Card';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import ActionButtons from '../ActionButtons';
import PostMetadata from '../PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { TrendingFlag } from '../../../lib/featureValues';
import { TrendingFlag as TrendingFlagComponent } from '../common/TrendingFlag';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../PostTags';

export const CollectionCard = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    openNewTab,
    onReadArticleClick,
    onPostClick,
    onBookmarkClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const tagsOnCard = useFeature(feature.tagsOnCard);
  const trendingFlag = useFeature(feature.trendingFlag);
  const isTrendingFlagV1 = trendingFlag === TrendingFlag.V1;
  const { pinnedAt, trending } = post;
  const image = usePostImage(post);
  const onPostCardClick = () => onPostClick(post);
  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className, 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, ...(!isTrendingFlagV1 && { trending }) }}
    >
      {trending && isTrendingFlagV1 && (
        <TrendingFlagComponent className={{ container: 'right-3 top-3' }} />
      )}
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />
      <CollectionCardHeader
        sources={post.collectionSources}
        totalSources={post.numCollectionSources}
        onMenuClick={(event) => onMenuClick?.(event, post)}
      />
      <FreeformCardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
          'px-2 font-bold text-text-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>

      {!!post.image && <CardSpace />}
      {tagsOnCard && <PostTags tags={post.tags} />}
      <PostMetadata
        createdAt={post.createdAt}
        readTime={post.readTime}
        className={classNames('m-2', post.image ? 'mb-0' : 'mb-4')}
      />

      <Container>
        <WelcomePostCardFooter image={image} contentHtml={post.contentHtml} />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          className={classNames('mx-4 mt-auto justify-between')}
          onBookmarkClick={onBookmarkClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
