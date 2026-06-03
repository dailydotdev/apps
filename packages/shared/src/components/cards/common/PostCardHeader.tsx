import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import type { Source } from '../../../graphql/sources';
import { isSourceUserSource } from '../../../graphql/sources';
import { ReadArticleButton, getReadPostButtonIcon } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import { useLegacyPostLayoutOptOut } from '../../post/reader/hooks/useLegacyPostLayoutOptOut';
import type { Post } from '../../../graphql/posts';
import {
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
  PostType,
} from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/Button';
import { useReaderModalEligibility } from '../../post/reader/hooks/useReaderModalEligibility';
import { EarthIcon } from '../../icons';
import type { FlagProps } from './FeedItemContainer';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize } from '../../ProfilePicture';
import { DeletedPostId } from '../../../lib/constants';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import type { UserShortProfile } from '../../../lib/user';

const HoverCard = dynamic(
  /* webpackChunkName: "hoverCard" */ () => import('./HoverCard'),
);

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../entity/UserEntityCard'),
);

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  source: Source;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink: string;
  openNewTab?: boolean;
  flagProps?: FlagProps;
  showFeedback?: boolean;
  primaryAction?: ReactNode;
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onReadArticleClick,
  children,
  source,
  postLink,
  openNewTab,
  showFeedback,
  primaryAction,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const isSharedPostDeleted = post.sharedPost?.id === DeletedPostId;
  const isUserSource = isSourceUserSource(post.source);
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: (post.bookmarked && !showFeedback) ?? false,
  });
  const { isEligible: isReaderEligible, isReaderModalEnabled } =
    useReaderModalEligibility();
  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();
  // Variant: clicking Read post on the card opens the reader preview inside
  // daily.dev (globe-icon CTA) instead of navigating to the external article.
  // Once a user opts out (via the install-prompt overlay) the card reverts
  // to the classic external Read post button.
  const isReaderVariant =
    isReaderEligible &&
    isReaderModalEnabled &&
    post.type === PostType.Article &&
    !isLegacyLayoutOptedOut;
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);

  const handleReadArticleClick = (event: React.MouseEvent) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticleClick?.(event);
  };

  const readPostIcon = isReaderVariant ? (
    <EarthIcon />
  ) : (
    getReadPostButtonIcon(post)
  );

  const articleLink = useMemo(() => {
    if (post.sharedPost) {
      const shouldUseInternalLink =
        isSharedPostSquadPost(post) || isInternalReadType(post.sharedPost);

      return shouldUseInternalLink
        ? post.sharedPost?.commentsPermalink
        : post.sharedPost?.permalink;
    }

    return postLink;
  }, [post, postLink]);

  return (
    <>
      {highlightBookmarkedPost && <BookmakProviderHeader />}
      <CardHeader
        className={classNames(
          className,
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        {!isUserSource && <SourceButton source={source} />}
        {!!post?.author && (
          <HoverCard
            align="start"
            side="bottom"
            sideOffset={10}
            trigger={
              <ProfileImageLink
                picture={{ size: ProfileImageSize.Medium }}
                user={post.author}
              />
            }
          >
            <UserEntityCard user={post.author as UserShortProfile} />
          </HoverCard>
        )}
        {children}
        <Container
          className="ml-auto flex flex-row"
          data-testid="cardHeaderActions"
        >
          {!isFeedPreview && (
            <>
              {!isSharedPostDeleted &&
                (primaryAction ?? (
                  <ReadArticleButton
                    content={getReadPostButtonText(post)}
                    className="mr-2"
                    variant={ButtonVariant.Primary}
                    href={articleLink ?? ''}
                    onClick={handleReadArticleClick}
                    openNewTab={openNewTab}
                    icon={readPostIcon}
                  />
                ))}
              <PostOptionButton post={post} />
            </>
          )}
        </Container>
      </CardHeader>
    </>
  );
};
