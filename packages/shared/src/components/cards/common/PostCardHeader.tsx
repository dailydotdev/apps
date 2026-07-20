import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CardHeader } from './Card';
import type { Source } from '../../../graphql/sources';
import { AuthorSourceStack } from './AuthorSourceStack';
import { ReadArticleButton, getReadPostButtonIcon } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
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
import { DeletedPostId } from '../../../lib/constants';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';

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
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: (post.bookmarked && !showFeedback) ?? false,
  });
  const { isReaderEnabled } = useReaderModalEligibility();
  // Variant: clicking Read post on the card opens the reader preview inside
  // daily.dev (globe-icon CTA) instead of navigating to the external article.
  // Once a user opts out (via the install-prompt overlay or settings) the card
  // reverts to the classic external Read post button.
  const isReaderVariant = isReaderEnabled && post.type === PostType.Article;
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
        <AuthorSourceStack author={post.author} source={source} />
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
