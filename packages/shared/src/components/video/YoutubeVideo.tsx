import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { YoutubeVideoWithoutConsentProps } from './YoutubeVideoWithoutConsent';
import { YoutubeVideoWithoutConsent } from './YoutubeVideoWithoutConsent';
import { YoutubeVideoBackground, YoutubeVideoContainer } from './common';
import { useConsentCookie } from '../../hooks/useCookieConsent';

interface YoutubeVideoProps {
  videoId: string;
  className?: string;
  placeholderProps: Pick<
    YoutubeVideoWithoutConsentProps,
    'post' | 'onWatchVideo'
  >;
}

const YoutubeVideo = ({
  videoId,
  className,
  placeholderProps,
}: YoutubeVideoProps): ReactElement => {
  const { title } = placeholderProps.post;
  const { isAuthReady, isGdprCovered } = useAuthContext();
  const { cookieExists, saveCookies } = useConsentCookie(
    GdprConsentKey.Marketing,
  );

  if (!isAuthReady) {
    return (
      <YoutubeVideoContainer className={className}>
        <YoutubeVideoBackground />
      </YoutubeVideoContainer>
    );
  }

  if (isGdprCovered && !cookieExists) {
    return (
      <YoutubeVideoWithoutConsent
        {...placeholderProps}
        onAcceptCookies={saveCookies}
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
      />
    </YoutubeVideoContainer>
  );
};

export default YoutubeVideo;
