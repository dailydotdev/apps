import React, { ReactElement } from 'react';
import classNames from 'classnames';
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
  enableSourceHeader,
}: WelcomePostCardHeaderProps): ReactElement => {
  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      <div className="relative">
        <ProfilePicture
          user={author}
          size={enableSourceHeader ? undefined : 'xsmall'}
          className={classNames(!enableSourceHeader && 'top-7 -right-2.5')}
          absolute={!enableSourceHeader}
        />
        <SourceButton
          source={source}
          className={enableSourceHeader && 'absolute -right-2 -bottom-2'}
          size={enableSourceHeader ? 'xsmall' : 'large'}
        />
      </div>
      <div className="flex flex-col flex-1 flex-grow mr-6 ml-2 typo-footnote">
        <span className="font-bold line-clamp-2">
          {enableSourceHeader ? author.name : source.name}
        </span>
        <PostMetadata
          className="break-words line-clamp-1"
          createdAt={createdAt}
          description={`@${author.username}`}
        />
      </div>
    </div>
  );
};
