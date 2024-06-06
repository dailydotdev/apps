import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
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
    <div className="relative m-2 flex gap-2">
      <div className="relative">
        {author && (
          <ProfilePicture
            user={author}
            size={
              enableSourceHeader
                ? ProfileImageSize.XSmall
                : ProfileImageSize.XLarge
            }
            className={enableSourceHeader && '-right-2.5 top-7'}
            absolute={enableSourceHeader}
          />
        )}
        <SourceButton
          source={source}
          className={!enableSourceHeader && 'absolute -bottom-2 -right-2'}
          size={
            enableSourceHeader
              ? ProfileImageSize.Large
              : ProfileImageSize.XSmall
          }
        />
      </div>
      <div className="ml-2 mr-6 flex flex-1 flex-col overflow-auto typo-footnote">
        <span
          className="line-clamp-2 break-words font-bold"
          title={getHeaderName()}
        >
          {getHeaderName()}
        </span>
        <PostMetadata
          className="line-clamp-1 break-words"
          createdAt={createdAt}
          description={getDescription()}
        />
      </div>
    </div>
  );
};
