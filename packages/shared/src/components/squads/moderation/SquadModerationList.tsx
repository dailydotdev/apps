import React, { ReactElement } from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { CardImage } from '../../cards/common/Card';
import PostTags from '../../cards/common/PostTags';
import { SourcePostModeration } from '../../../graphql/squads';
import { SquadModerationActions } from './SquadModerationActions';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import PostMetadata from '../../cards/common/PostMetadata';

interface SquadModerationListProps {
  data: SourcePostModeration;
}

export function SquadModerationList({
  data,
}: SquadModerationListProps): ReactElement {
  const { post } = data;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row gap-4">
        <ProfilePicture user={post.author} size={ProfileImageSize.Large} />
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Footnote}>
            {post.author.name}
          </Typography>
          <PostMetadata readTime={post.readTime} createdAt={post.createdAt} />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {post.sharedPost?.title || post.title}
          </Typography>
          <PostTags
            className="!mx-0"
            tags={post.sharedPost?.tags || post.tags}
          />
        </div>
        <CardImage src={post.sharedPost?.image || post.image} />
      </div>
      <SquadModerationActions postId={post.id} />
    </div>
  );
}
