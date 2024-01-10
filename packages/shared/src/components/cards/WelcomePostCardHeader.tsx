import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { ProfilePicture } from '../ProfilePicture';
import SourceButton from './SourceButton';
import PostMetadata from './PostMetadata';

type WelcomePostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'createdAt'
> & { enableSourceHeader?: boolean };

export const WelcomePostCardHeader = ({
  author,
  createdAt,
  source,
  enableSourceHeader = false,
}: WelcomePostCardHeaderProps): ReactElement => {
  return (
    <div className="relative m-2 flex flex-row gap-2">
      <div className="relative">
        <ProfilePicture
          user={author}
          size={enableSourceHeader ? 'xsmall' : 'xlarge'}
          className={enableSourceHeader && '-right-2.5 top-7'}
          absolute={enableSourceHeader}
        />
        <SourceButton
          source={source}
          className={!enableSourceHeader && 'absolute -bottom-2 -right-2'}
          size={enableSourceHeader ? 'large' : 'xsmall'}
        />
      </div>
      <div className="ml-2 mr-6 flex flex-1 flex-grow flex-col typo-footnote">
        <span className="line-clamp-2 font-bold">
          {enableSourceHeader ? source.name : author.name}
        </span>
        <PostMetadata
          className="line-clamp-1 break-words"
          createdAt={createdAt}
          description={enableSourceHeader ? author.name : `@${author.username}`}
        />
      </div>
    </div>
  );
};
