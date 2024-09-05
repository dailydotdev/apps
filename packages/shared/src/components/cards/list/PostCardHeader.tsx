import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';

import { Post, PostType } from '../../../graphql/posts';
import { useFeedPreviewMode } from '../../../hooks';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import { ButtonVariant } from '../../buttons/common';
import OptionsButton from '../../buttons/OptionsButton';
import { MenuIcon, OpenLinkIcon } from '../../icons';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileImageSize } from '../../ProfilePicture';
import { getGroupedHoverContainer } from '../common';
import { ReadArticleButton } from '../ReadArticleButton';
import { BookmakProviderHeader } from './BookmarkProviderHeader';
import { useReadPostButtonText } from './hooks';
import { CardHeader } from './ListCard';
import PostMetadata, { PostMetadataProps } from './PostMetadata';

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
        {!!post?.author && (
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
