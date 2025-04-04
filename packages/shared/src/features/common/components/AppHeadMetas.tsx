import type { ReactElement } from 'react';
import React from 'react';
import { fromCDN } from '../../../lib';

export function AppHeadMetas(): ReactElement {
  return (
    <>
      <meta
        name="viewport"
        content="initial-scale=1.0, width=device-width, viewport-fit=cover"
      />

      <meta name="application-name" content="daily.dev" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="daily.dev" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="slack-app-id" content="A07AM7XC529" />
      <meta name="apple-itunes-app" content="app-id=6740634400" />

      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={fromCDN('/apple-touch-icon.png')}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={fromCDN('/favicon-32x32.png')}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={fromCDN('/favicon-16x16.png')}
      />
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="sitemap"
        type="text/plain"
        title="Sitemap"
        href="/sitemap.txt"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('load', () => { window.windowLoaded = true; }, {
      once: true,
    });`,
        }}
      />

      <link rel="preconnect" href="https://api.daily.dev" />
      <link rel="preconnect" href="https://sso.daily.dev" />
      <link rel="preconnect" href="https://media.daily.dev" />
    </>
  );
}
