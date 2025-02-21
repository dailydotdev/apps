import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { sanitize } from 'dompurify';

import type { PostCardProps } from '../common/common';
import { Container, generateTitleClamp } from '../common/common';
import {
  useConditionalFeature,
  useFeedPreviewMode,
  useTruncatedSummary,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { usePostImage } from '../../../hooks/post/usePostImage';
import SquadHeaderPicture from '../common/SquadHeaderPicture';
import { PostContentReminder } from '../../post/common/PostContentReminder';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/list/ActionButtons';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { featureSocialShare } from '../../../lib/featureManagement';
import SocialBar from '../socials/SocialBar';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { PostType } from '../../../graphql/posts';

export const FreeformList = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    onShare,
    children,
    enableSourceHeader = false,
    domProps = {},
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { interaction } = usePostActions({ post });
  const { pinnedAt, type: postType } = post;
  const isMobile = useViewSize(ViewSize.MobileL);
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const image = usePostImage(post);
  const { title } = useSmartTitle(post);
  const content = useMemo(
    () =>
      post.contentHtml ? sanitize(post.contentHtml, { ALLOWED_TAGS: [] }) : '',
    [post.contentHtml],
  );
  const { value: socialShare } = useConditionalFeature({
    feature: featureSocialShare,
    shouldEvaluate: interaction === 'copy' && post.type === PostType.Freeform,
  });

  const { title: truncatedTitle } = useTruncatedSummary(title, content);

  const actionButtons = (
    <Container ref={containerRef} className="pointer-events-none">
      <ActionButtons
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
        className={classNames(
          'mt-2 justify-between',
          !!image && 'laptop:mt-auto',
        )}
      />
    </Container>
  );

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: classNames(domProps.className),
      }}
      ref={ref}
      flagProps={{ pinnedAt, type: postType }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader
          post={post}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          metadata={{
            topLabel: enableSourceHeader ? post.source.name : post.author.name,
            bottomLabel: enableSourceHeader
              ? post.author.name
              : `@${post.source.handle ?? post.sharedPost.source.handle}`,
          }}
        >
          <SquadHeaderPicture
            source={post.source}
            reverse={!enableSourceHeader}
          />
        </PostCardHeader>

        <CardContent className="my-2">
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle
              className={classNames(
                generateTitleClamp({
                  hasImage: !!image,
                  hasHtmlContent: !!post.contentHtml,
                }),
                'multi-truncate',
              )}
            >
              {truncatedTitle}
            </CardTitle>

            {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
            <div className="hidden flex-1 tablet:flex" />
            {!isMobile && actionButtons}
          </div>

          {image && (
            <CardCoverList
              onShare={onShare}
              post={post}
              imageProps={{
                alt: 'Post Cover image',
                className: 'w-full mobileXXL:self-start mt-2 tablet:mt-0',
                ...(eagerLoadImage && HIGH_PRIORITY_IMAGE_PROPS),
                src: image,
              }}
            />
          )}
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {!image && <PostContentReminder post={post} className="z-1" />}
      {children}
      {socialShare && <SocialBar className="mt-4" post={post} />}
    </FeedItemContainer>
  );
});
