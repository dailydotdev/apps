import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import OptionsButton from '../buttons/OptionsButton';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import { Source } from '../../graphql/sources';
import { ReadArticleButton } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';
import { useFeedPreviewMode } from '../../hooks';
import { getReadPostButtonText, Post } from '../../graphql/posts';
import { ButtonVariant } from '../buttons/Button';
import { FlagProps } from './FeedItemContainer';
import { BookmarkIcon } from '../icons';
import { useBookmarkProvider } from '../../hooks/useBookmarkProvider';

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
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const highlightBookmarkedPost = useBookmarkProvider(post.bookmarked);

  return (
    <>
      {highlightBookmarkedPost && (
        <CardHeader
          className={classNames(
            className,
            'laptop:mouse:flex laptop:mouse:group-hover:hidden',
            'text-action-bookmark-default typo-footnote',
          )}
        >
          <BookmarkIcon secondary className="ml-1 mr-1" />
          Revisit this post you saved earlier?
        </CardHeader>
      )}
      <CardHeader
        className={classNames(
          className,
          highlightBookmarkedPost &&
            'laptop:mouse:hidden laptop:mouse:group-hover:flex',
        )}
      >
        <SourceButton source={source} />
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
