import React from 'react';
import { Post } from '../../../graphql/posts';
import { ProfilePicture, ProfilePictureGroup } from '../../ProfilePicture';
import PostMetadata from '../PostMetadata';
import TagButton from '../../filters/TagButton';
import OptionsButton from '../../buttons/OptionsButton';
import { PostCardProps } from '../common';

type CollectionCardHeaderProps = {
  post: Post;
  full?: boolean;
  onMenuClick: PostCardProps['onMenuClick'];
};

export const CollectionCardHeader = ({
  post,
  full,
  onMenuClick,
}: CollectionCardHeaderProps) => {
  // TODO: replace this with the actual query to retrieve related sources
  const relatedSources = [post.source, post.source];

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

          {/* <div className="flex flex-col flex-1 flex-grow mr-6 ml-2 typo-footnote"> */}
          {/*  /!*  <span className="font-bold line-clamp-2">{post.source.name}</span> *!/ */}
          {/*  <PostMetadata */}
          {/*    className="break-words line-clamp-1" */}
          {/*    createdAt={post.createdAt} */}
          {/*    description={`@${post.author?.username}`} */}
          {/*  /> */}
          {/* </div> */}

          <OptionsButton
            className="group-hover:flex laptop:hidden top-2 right-2"
            onClick={(event) => onMenuClick?.(event, post)}
            tooltipPlacement="top"
            position="absolute"
          />
        </>
      )}
    </div>
  );
};
