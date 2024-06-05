import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { formatReadTime } from '../../utilities';

interface PostReadTimeProps extends Pick<Post, 'readTime'> {
  isVideoType?: boolean;
}

export default function PostReadTime({
  readTime,
  isVideoType = false,
}: PostReadTimeProps): ReactElement {
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  if (!showReadTime) {
    return null;
  }

  const timeActionContent = isVideoType ? 'watch' : 'read';
  return (
    <span data-testid="readTime">
      {formatReadTime(readTime)} {timeActionContent} time
    </span>
  );
}
