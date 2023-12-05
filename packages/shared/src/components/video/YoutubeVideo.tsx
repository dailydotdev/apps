import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface YoutubeVideoProps {
  videoId: string;
  className?: string;
  title: string;
}

const YoutubeVideo = ({
  videoId,
  className,
  title,
  ...props
}: YoutubeVideoProps): ReactElement => (
  <div
    className={classNames(
      'overflow-hidden relative pt-[56.25%] w-full',
      className,
    )}
  >
    <iframe
      title={title}
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      className="absolute inset-0 w-full border-0 aspect-video"
      {...props}
    />
  </div>
);

export default YoutubeVideo;
