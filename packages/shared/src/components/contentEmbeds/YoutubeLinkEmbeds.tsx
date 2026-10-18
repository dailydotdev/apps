import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import YoutubeVideo from '../video/YoutubeVideo';
import { getYoutubeVideoIdsFromHtml } from '../../lib/youtube';

type YoutubeLinkEmbedsProps = {
  contentHtml?: string | null;
  className?: string;
};

export const YoutubeLinkEmbeds = ({
  contentHtml,
  className,
}: YoutubeLinkEmbedsProps): ReactElement | null => {
  const videoIds = useMemo(
    () => getYoutubeVideoIdsFromHtml(contentHtml),
    [contentHtml],
  );

  if (!videoIds.length) {
    return null;
  }

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      {videoIds.map((videoId) => (
        <YoutubeVideo
          key={videoId}
          videoId={videoId}
          placeholderProps={{
            post: {
              title: 'YouTube video',
              permalink: `https://www.youtube.com/watch?v=${videoId}`,
            },
            className: '!mb-0',
          }}
        />
      ))}
    </div>
  );
};
