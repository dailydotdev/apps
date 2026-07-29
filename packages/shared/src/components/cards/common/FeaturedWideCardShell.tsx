import type { ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { PostHeroSignificance } from '../../../graphql/types';
import type { PostCardProps } from './common';
import FeedItemContainer from './FeedItemContainer';
import type { FlagProps } from './FeedItemContainer';
import { getPostClassNames } from './Card';
import CardOverlay from './CardOverlay';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';
import { WhyFeaturedButton } from './WhyFeaturedButton';

export type FeaturedWideCardShellProps = {
  post: Post;
  domProps?: PostCardProps['domProps'];
  useGlass?: boolean;
  onPostClick?: PostCardProps['onPostClick'];
  onPostAuxClick?: PostCardProps['onPostAuxClick'];
  overlayAriaLabel?: string;
  flagProps?: FlagProps;
  bookmarked?: boolean;
  significance?: PostHeroSignificance | null;
  children: ReactNode;
};

export const FeaturedWideCardShell = forwardRef(function FeaturedWideCardShell(
  {
    post,
    domProps = {},
    useGlass,
    onPostClick,
    onPostAuxClick,
    overlayAriaLabel,
    flagProps,
    bookmarked,
    significance,
    children,
  }: FeaturedWideCardShellProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick?.(post);
  const onPostCardAuxClick = () => onPostAuxClick?.(post);

  if (isHidden) {
    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          style,
          className: getPostClassNames(post, className ?? '', 'min-h-card'),
        }}
        ref={ref}
        flagProps={flagProps}
        bookmarked={post.bookmarked}
      >
        {hiddenPanel}
      </FeedItemContainer>
    );
  }

  if (data?.showTagsPanel && (post.tags?.length ?? 0) > 0) {
    return (
      <PostTagsPanel
        className="h-full overflow-hidden"
        post={post}
        toastOnSuccess
      />
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className: getPostClassNames(
          post,
          classNames(className ?? '', 'h-full overflow-hidden'),
          useGlass ? 'min-h-cardGlass' : 'min-h-card',
        ),
      }}
      ref={ref}
      flagProps={flagProps}
      bookmarked={bookmarked}
    >
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
        ariaLabel={overlayAriaLabel}
      />
      {children}
      <WhyFeaturedButton significance={significance} />
    </FeedItemContainer>
  );
});
