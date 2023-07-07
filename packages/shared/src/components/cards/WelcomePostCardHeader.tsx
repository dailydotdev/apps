import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { ProfilePicture } from '../ProfilePicture';
import SourceButton from './SourceButton';
import PostMetadata from './PostMetadata';

type WelcomePostCardHeaderProps = Pick<Post, 'author' | 'source' | 'createdAt'>;

export const WelcomePostCardHeader = ({
  author,
  createdAt,
  source,
}: WelcomePostCardHeaderProps): ReactElement => {
  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      <div className="relative">
        <ProfilePicture user={author} />
        <SourceButton
          source={source}
          className="absolute -right-2 -bottom-2"
          size="xsmall"
        />
      </div>
      <div className="flex flex-col flex-1 flex-grow mr-6 ml-2 typo-footnote">
        <span className="font-bold line-clamp-2">{author.name}</span>
        <PostMetadata
          className="break-words line-clamp-1"
          createdAt={createdAt}
          username={author.username}
        />
      </div>
    </div>
  );
};
