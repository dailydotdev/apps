import React from 'react';
import { Post } from '../../../graphql/posts';
import { ProfilePicture, ProfilePictureGroup } from '../../ProfilePicture';
import PostMetadata from '../PostMetadata';
import TagButton from '../../filters/TagButton';

type CollectionCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'createdAt'
> & { full?: boolean };

export const CollectionCardHeader = ({
  source,
  author,
  createdAt,
  full,
}: CollectionCardHeaderProps) => {
  // TODO: replace this with the actual query to retrieve related sources
  const relatedSources = [source, source];

  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      {!full && (
        <div className="relative">
          <TagButton tagItem="collection" />
        </div>
      )}

      {full && (
        <>
          <div className="relative">
            <ProfilePictureGroup>
              {relatedSources.map((s) => (
                <ProfilePicture
                  key={s?.id}
                  user={s}
                  size="medium"
                  rounded="full"
                />
              ))}
            </ProfilePictureGroup>
          </div>

          <div className="flex flex-col flex-1 flex-grow mr-6 ml-2 typo-footnote">
            <span className="font-bold line-clamp-2">{source.name}</span>
            <PostMetadata
              className="break-words line-clamp-1"
              createdAt={createdAt}
              description={`@${author?.username}`}
            />
          </div>
        </>
      )}
    </div>
  );
};
