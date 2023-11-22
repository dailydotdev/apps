import React from 'react';
import { Post } from '../../../graphql/posts';
import Pill from '../../Pill';
import { ProfilePicture, ProfilePictureGroup } from '../../ProfilePicture';

type CollectionCardHeaderProps = {
  post: Post;
};

export const CollectionCardHeader = ({ post }: CollectionCardHeaderProps) => {
  // TODO: replace this with the actual query to retrieve related sources
  const relatedSources = [post.source, post.source];

  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      {/* <div className="relative"> */}
      {/*  <Pill label="Collection" className="text-theme-color-cabbage" /> */}
      {/* </div> */}

      <>
        <div className="relative">
          <ProfilePictureGroup limit={2} total={6}>
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
      </>
    </div>
  );
};
