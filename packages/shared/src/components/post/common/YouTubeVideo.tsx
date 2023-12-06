import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface YouTubeVideoProps {
  title: string;
  videoId: string;
  className?: string;
}

export function YouTubeVideo({
  title,
  videoId,
  className,
}: YouTubeVideoProps): ReactElement {
  return (
    <iframe
      title={title}
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      className={classNames('w-full rounded-16 border-0', className)}
    />
  );
}
