import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { ProfilePicture } from '../ProfilePicture';
import SourceButton from './SourceButton';
import PostMetadata from './PostMetadata';

type SharedPostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'createdAt'
>;

export const SharedPostCardHeader = ({
  author,
  createdAt,
  source,
}: SharedPostCardHeaderProps): ReactElement => {
  return (
    <div className="relative m-2 mb-3 flex flex-row gap-2">
      <div className="relative">
        <ProfilePicture user={author} />
        <SourceButton
          source={source}
          className="absolute -right-2 -bottom-2"
          size="xsmall"
        />
      </div>
      <div className="mr-6 ml-2 flex flex-1 flex-grow flex-col typo-footnote">
        <span className="font-bold line-clamp-2">{author.name}</span>
        <PostMetadata
          className="!flex text-theme-label-secondary line-clamp-1"
          createdAt={createdAt}
          username={author.username}
        />
      </div>
    </div>
  );
};
