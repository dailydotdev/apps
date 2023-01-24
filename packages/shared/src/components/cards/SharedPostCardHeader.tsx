import React, { ReactElement } from 'react';
import { CardHeader } from './Card';
import { Post } from '../../graphql/posts';
import { ProfilePicture } from '../ProfilePicture';
import SourceButton from './SourceButton';
import PostMetadata from './PostMetadata';
import OptionsButton from '../buttons/OptionsButton';

type SharedPostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'createdAt'
> & {
  onMenuClick?: (e: React.MouseEvent) => void;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
};

export const SharedPostCardHeader = ({
  author,
  createdAt,
  source,
  onMenuClick,
}: SharedPostCardHeaderProps): ReactElement => {
  return (
    <CardHeader className="gap-4 mt-4 mb-6">
      <div className="relative">
        <ProfilePicture user={author} />
        <SourceButton
          source={source}
          className="absolute -right-2 -bottom-2"
          size="xsmall"
        />
      </div>
      <div className="flex flex-col flex-grow typo-footnote">
        <span className="font-bold">{author.name}</span>
        <PostMetadata
          className="text-theme-label-secondary"
          createdAt={createdAt}
          username={author.username}
        />
      </div>
      <OptionsButton onClick={onMenuClick} tooltipPlacement="top" />
    </CardHeader>
  );
};
