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
import { TrendingIcon } from '../icons';
import { IconSize } from '../Icon';

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
  flagProps,
}: CardHeaderProps): ReactElement => {
  const { trending } = flagProps;
  const isFeedPreview = useFeedPreviewMode();

  return (
    <CardHeader className={classNames(className, 'relative')}>
      <SourceButton source={source} />
      {children}
      {trending && (
        <div className="absolute right-0 flex h-8 items-center rounded-10 bg-action-downvote-default px-3 py-1 font-bold text-white typo-callout laptop:mouse:group-hover:invisible">
          Trending{' '}
          <TrendingIcon className="ml-1" secondary size={IconSize.Small} />
        </div>
      )}
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
