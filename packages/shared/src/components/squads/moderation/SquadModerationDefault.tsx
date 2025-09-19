import type { ReactElement } from 'react';
import React from 'react';
import { CardImage } from '../../cards/common/Card';
import PostTags from '../../cards/common/PostTags';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { SquadModerationItemProps } from './useSourceModerationItem';
import { useTruncatedSummary } from '../../../hooks';

export function SquadModerationDefault({
  data,
}: SquadModerationItemProps): ReactElement {
  const post = data.sharedPost || data.post;
  const { title } = useTruncatedSummary(
    data?.title || data.sharedPost?.title || data.post?.title,
  );

  return (
    <div className="flex flex-col gap-4 tablet:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <Typography
          className="break-words"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          bold
        >
          {title}
        </Typography>
        <PostTags className="!mx-0 min-w-full" post={post} />
      </div>
      <div className="flex-1">
        <CardImage className="mx-auto" src={data.image || post?.image} />
      </div>
    </div>
  );
}
