import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../../graphql/posts';
import { formatReadTime } from '../../../utilities';

interface PostReadTimeProps extends Pick<Post, 'readTime'> {
  isVideoType?: boolean;
}

export default function PostReadTime({
  readTime,
  isVideoType = false,
}: PostReadTimeProps): ReactElement | null {
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  if (!showReadTime) {
    return null;
  }

  const timeActionContent = isVideoType ? 'watch' : 'read';
  return (
    <span data-testid="readTime">
      {formatReadTime(readTime ?? 0)} {timeActionContent} time
    </span>
  );
}
