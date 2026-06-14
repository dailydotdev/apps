import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { YoutubeVideoWithoutConsentProps } from './YoutubeVideoWithoutConsent';
import { YoutubeVideoWithoutConsent } from './YoutubeVideoWithoutConsent';
import { YoutubeVideoBackground, YoutubeVideoContainer } from './common';
import { useConsentCookie } from '../../hooks/useCookieConsent';
import { isExtension } from '../../lib/func';
import { webappUrl } from '../../lib/constants';

interface YoutubeVideoProps extends HTMLAttributes<HTMLIFrameElement> {
  videoId: string;
  className?: string;
  autoplay?: boolean;
  placeholderProps: Pick<
    YoutubeVideoWithoutConsentProps,
    'post' | 'onWatchVideo'
  >;
}

const YoutubeVideo = ({
  videoId,
  className,
  autoplay = false,
  placeholderProps,
  ...props
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

  // Cross-origin iframes block UNMUTED autoplay even with a parent click
  // gesture, so YouTube would fall back to its play button (a second press).
  // Muted autoplay is reliably permitted; YouTube shows its native unmute.
  const autoplayParam = autoplay ? '?autoplay=1&mute=1' : '';
  // Extension pages don't send Referer header, causing YouTube Error 153
  // Use webapp as intermediate page which sends proper Referer
  const embedSrc = isExtension
    ? `${webappUrl}embed/youtube/${videoId}${autoplayParam}`
    : `https://www.youtube-nocookie.com/embed/${videoId}${autoplayParam}`;

  return (
    <YoutubeVideoContainer className={className}>
      <iframe
        {...props}
        title={title}
        src={embedSrc}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 aspect-video w-full border-0"
      />
    </YoutubeVideoContainer>
  );
};

export default YoutubeVideo;
