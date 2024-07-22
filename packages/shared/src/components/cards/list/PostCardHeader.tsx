import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import OptionsButton from '../../buttons/OptionsButton';
import { CardHeader } from './ListCard';
import { ReadArticleButton } from '../ReadArticleButton';
import { getGroupedHoverContainer } from '../common';
import { useConditionalFeature, useFeedPreviewMode } from '../../../hooks';
import { Post, PostType } from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/common';
import PostMetadata, { PostMetadataProps } from './PostMetadata';
import { MenuIcon, OpenLinkIcon } from '../../icons';
import { useReadPostButtonText } from './hooks';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import { BookmakProviderHeader } from './BookmarkProviderHeader';
import { ProfileImageSize } from '../../ProfilePicture';
import { feature } from '../../../lib/featureManagement';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileTooltip } from '../../profile/ProfileTooltip';

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  onMenuClick?: (e: React.MouseEvent) => void;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink?: string;
  openNewTab?: boolean;
  metadata?: {
    topLabel?: PostMetadataProps['topLabel'];
    bottomLabel?: PostMetadataProps['bottomLabel'];
  };
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onMenuClick,
  onReadArticleClick,
  children,
  postLink,
  openNewTab,
  metadata,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const postButtonText = useReadPostButtonText(post);
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: post.bookmarked,
  });
  const { value: shouldShowImage } = useConditionalFeature({
    shouldEvaluate: !!post?.author,
    feature: feature.authorImage,
  });

  const isCollectionType = post.type === 'collection';
  const showCTA =
    !isFeedPreview &&
    [PostType.Article, PostType.VideoYouTube].includes(post.type);

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader className={classNames(className, 'mb-4')} />
      )}
      <CardHeader className={className}>
        {children}
        {shouldShowImage && post.author && (
          <ProfileTooltip user={post.author}>
            <ProfileImageLink
              className="z-1 ml-2"
              picture={{ size: ProfileImageSize.Large }}
              user={post.author}
            />
          </ProfileTooltip>
        )}
        <PostMetadata
          className={classNames(
            'mr-2 flex-1',
            !isCollectionType && 'ml-4',
            isCollectionType && 'ml-2',
          )}
          createdAt={post.createdAt}
          {...metadata}
        />
        <Container
          className="relative ml-auto flex flex-row"
          data-testid="cardHeaderActions"
        >
          {!isFeedPreview && (
            <>
              {showCTA && (
                <ReadArticleButton
                  content={postButtonText}
                  className="mr-2"
                  variant={ButtonVariant.Tertiary}
                  icon={<OpenLinkIcon />}
                  href={postLink}
                  onClick={onReadArticleClick}
                  openNewTab={openNewTab}
                />
              )}
              <OptionsButton
                icon={<MenuIcon className="rotate-90" />}
                onClick={onMenuClick}
                tooltipPlacement="top"
              />
            </>
          )}
        </Container>
      </CardHeader>
    </>
  );
};
