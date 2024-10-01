import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import OptionsButton from '../../buttons/OptionsButton';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import { Source } from '../../../graphql/sources';
import { ReadArticleButton } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import {
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
  Post,
} from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/Button';
import { FlagProps } from './FeedItemContainer';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize } from '../../ProfilePicture';

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
          <ProfileTooltip userId={post.author.id}>
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
                href={articleLink}
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
