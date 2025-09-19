import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { SquadModerationItemProps } from './useSourceModerationItem';
import { useTruncatedSummary } from '../../../hooks';
import { PollOptionButtons } from '../../cards/poll/PollOptions';

export function SquadModerationPoll({
  data,
}: SquadModerationItemProps): ReactElement {
  const post = data.sharedPost || data.post;
  const { title } = useTruncatedSummary(
    data?.title || data.sharedPost?.title || data.post?.title,
  );

  return (
    <div className="flex flex-col gap-2">
      <Typography
        className="mb-2 line-clamp-1"
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        bold
      >
        {title}
      </Typography>
      <PollOptionButtons options={post.pollOptions} />
    </div>
  );
}
