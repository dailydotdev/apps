import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { ProfilePicture } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import PostMetadata from '../PostMetadata';

type SquadPostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'createdAt'
> & { enableSourceHeader?: boolean };

export const SquadPostCardHeader = ({
  author,
  createdAt,
  source,
  enableSourceHeader = false,
}: SquadPostCardHeaderProps): ReactElement => {
  const getDescription = () => {
    if (!author) {
      return undefined;
    }

    return enableSourceHeader ? author.name : `@${author.username}`;
  };

  const getHeaderName = () => {
    if (enableSourceHeader) {
      return source.name;
    }

    return author?.name || '';
  };

  return (
    <div className="flex relative flex-row gap-2 m-2">
      <div className="relative">
        {author && (
          <ProfilePicture
            user={author}
            size={enableSourceHeader ? 'xsmall' : 'xlarge'}
            className={enableSourceHeader && 'top-7 -right-2.5'}
            absolute={enableSourceHeader}
          />
        )}
        <SourceButton
          source={source}
          className={!enableSourceHeader && 'absolute -right-2 -bottom-2'}
          size={enableSourceHeader ? 'large' : 'xsmall'}
        />
      </div>
      <div className="flex flex-col flex-1 flex-grow mr-6 ml-2 typo-footnote">
        <span className="font-bold line-clamp-2">{getHeaderName()}</span>
        <PostMetadata
          className="break-words line-clamp-1"
          createdAt={createdAt}
          description={getDescription()}
        />
      </div>
    </div>
  );
};
