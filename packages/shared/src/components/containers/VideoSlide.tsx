import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

type VideoSlideProps = {
  src: string;
  className?: string;
  children?: React.ReactNode;
};

export const VideoSlide = ({ src, className, children }: VideoSlideProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className={classNames('h-full w-full object-contain', className)}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {children}
    </div>
  );
};

export type { VideoSlideProps };
