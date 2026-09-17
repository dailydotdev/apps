import type { GetServerSideProps } from 'next';
import type { ReactElement } from 'react';
import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  autoPlay: boolean;
}

export const getServerSideProps: GetServerSideProps<
  YouTubeEmbedProps
> = async ({ res, params, query }) => {
  const chromeId = process.env.EXTENSION_ID_CHROME;
  const edgeId = process.env.EXTENSION_ID_EDGE;

  // CSP frame-ancestors: only allow extension origins
  const frameAncestors = [
    "'self'",
    chromeId && `chrome-extension://${chromeId}`,
    edgeId && `chrome-extension://${edgeId}`,
  ]
    .filter(Boolean)
    .join(' ');

  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);

  const videoId = params?.videoId;

  if (!videoId || typeof videoId !== 'string') {
    return { notFound: true };
  }

  return { props: { videoId, autoPlay: query.autoplay === '1' } };
};

export default function YouTubeEmbed({
  videoId,
  autoPlay,
}: YouTubeEmbedProps): ReactElement {
  return (
    <iframe
      title="YouTube video player"
      src={`https://www.youtube-nocookie.com/embed/${videoId}${
        autoPlay ? '?autoplay=1' : ''
      }`}
      className="absolute inset-0 h-full w-full border-0"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
