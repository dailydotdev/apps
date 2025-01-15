import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { GdprConsentKey, useConsentCookie } from '../../hooks/useCookieBanner';
import type { Source } from '../../graphql/sources';
import { YoutubeVideoWithoutConsent } from './YoutubeVideoWithoutConsent';
import { YoutubeVideoBackground, YoutubeVideoContainer } from './common';

interface YoutubeVideoProps {
  videoId: string;
  className?: string;
  title: string;
  image: string;
  source: Source;
  onWatchVideo?: () => void;
}

const YoutubeVideo = ({
  videoId,
  className,
  title,
  image,
  source,
  onWatchVideo,
  ...props
}: YoutubeVideoProps): ReactElement => {
  const { isAuthReady, isGdprCovered } = useAuthContext();
  const [, onAcceptCookies, , exists] = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const hasAcceptedMarketing = useMemo(() => {
    if (!isAuthReady) {
      return false;
    }

    if (!isGdprCovered) {
      return true;
    }

    const disabled = globalThis?.localStorage.getItem(GdprConsentKey.Marketing);

    return exists || !disabled;
  }, [isAuthReady, isGdprCovered, exists]);

  if (!isAuthReady) {
    return (
      <YoutubeVideoContainer className={className}>
        <YoutubeVideoBackground />
      </YoutubeVideoContainer>
    );
  }

  if (isGdprCovered && !hasAcceptedMarketing) {
    return (
      <YoutubeVideoWithoutConsent
        {...{ title, image, source, onWatchVideo, onAcceptCookies }}
      />
    );
  }

  return (
    <YoutubeVideoContainer className={className}>
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 aspect-video w-full border-0"
        {...props}
      />
    </YoutubeVideoContainer>
  );
};

export default YoutubeVideo;
