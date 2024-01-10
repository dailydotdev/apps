import React, { ReactElement, ReactNode } from 'react';
import OptionsButton from '../../buttons/OptionsButton';
import { CardHeader } from './Card';
import SourceButton from '../SourceButton';
import { Source } from '../../../graphql/sources';
import { ReadArticleButton } from '../ReadArticleButton';
import { getGroupedHoverContainer } from '../common';
import { useFeedPreviewMode } from '../../../hooks';
import {
  Post,
  getReadPostButtonText,
  isVideoPost,
} from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/ButtonV2';
import PostMetadata from './PostMetadata';
import MenuIcon from '../../icons/Menu';

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  source: Source;
  onMenuClick?: (e: React.MouseEvent) => void;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink: string;
  openNewTab?: boolean;
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
  const isVideoType = isVideoPost(post);

  return (
    <CardHeader className={className}>
      <SourceButton size="large" source={source} />
      <PostMetadata
        className="ml-4"
        createdAt={post.createdAt}
        readTime={post.readTime}
        author={post.author}
        source={post.source}
        isVideoType={isVideoType}
      />
      {children}
      <Container
        className="relative ml-auto flex flex-row"
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
            <OptionsButton
              icon={<MenuIcon className="rotate-90" />}
              onClick={onMenuClick}
              tooltipPlacement="top"
            />
          </>
        )}
      </Container>
    </CardHeader>
  );
};
