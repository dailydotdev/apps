import React, { ReactElement, ReactNode } from 'react';
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

  return (
    <CardHeader className={className}>
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
  );
};
