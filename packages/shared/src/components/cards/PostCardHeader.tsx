import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';

import { getReadPostButtonText, Post } from '../../graphql/posts';
import { Source } from '../../graphql/sources';
import { useFeedPreviewMode } from '../../hooks';
import useBookmarkProvider from '../../hooks/useBookmarkProvider';
import { ButtonVariant } from '../buttons/Button';
import OptionsButton from '../buttons/OptionsButton';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageSize } from '../ProfilePicture';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { CardHeader } from './Card';
import { getGroupedHoverContainer } from './common';
import { FlagProps } from './FeedItemContainer';
import { ReadArticleButton } from './ReadArticleButton';
import SourceButton from './SourceButton';

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  source: Source;
  onMenuClick?: (e: React.MouseEvent) => void;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink: string;
  openNewTab?: boolean;
  flagProps?: FlagProps;
  showFeedback?: boolean;
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onMenuClick,
  onReadArticleClick,
  children,
  source,
  postLink,
  openNewTab,
  showFeedback,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();

  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: post.bookmarked && !showFeedback,
  });

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader className={className} isArticleCard />
      )}
      <CardHeader
        className={classNames(
          className,
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        <SourceButton source={source} />
        {!!post?.author && (
          <ProfileTooltip user={post.author}>
            <ProfileImageLink
              picture={{ size: ProfileImageSize.Medium }}
              user={post.author}
            />
          </ProfileTooltip>
        )}
        {children}
        <Container
          className="ml-auto flex flex-row"
          data-testid="cardHeaderActions"
        >
          {!isFeedPreview && (
            <>
              <ReadArticleButton
                content={getReadPostButtonText(post)}
                className="mr-2"
                variant={ButtonVariant.Primary}
                href={postLink}
                onClick={onReadArticleClick}
                openNewTab={openNewTab}
              />
              <OptionsButton onClick={onMenuClick} tooltipPlacement="top" />
            </>
          )}
        </Container>
      </CardHeader>
    </>
  );
};
