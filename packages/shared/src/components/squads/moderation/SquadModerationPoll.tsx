import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
  const orderedOptions = useMemo(
    () => post.pollOptions.sort((a, b) => a.order - b.order),
    [post.pollOptions],
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
      <PollOptionButtons options={orderedOptions} />
    </div>
  );
}
