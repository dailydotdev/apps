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
    <CardHeader className="gap-2 mt-4 mb-6">
      <div className="relative">
        <ProfilePicture user={author} />
        <SourceButton
          source={source}
          className="absolute -right-2 -bottom-2"
          size="xsmall"
        />
      </div>
      <div className="flex flex-col flex-1 flex-grow ml-2 typo-footnote">
        <span className="font-bold line-clamp-2">{author.name}</span>
        <PostMetadata
          className="line-clamp-1 text-theme-label-secondary !flex"
          createdAt={createdAt}
          username={author.username}
        />
      </div>
      <OptionsButton
        className="!mx-0"
        onClick={onMenuClick}
        tooltipPlacement="top"
      />
    </CardHeader>
  );
};
