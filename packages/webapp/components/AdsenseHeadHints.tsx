import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import {
  ADSENSE_PRECONNECT_ORIGINS,
  ADSENSE_SCRIPT_SRC,
} from '@dailydotdev/shared/src/components/post/arbitrage/adsense';

/**
 * Warms the ad path while the app is still hydrating: connections to the
 * three Google origins the first request will touch, plus the script bytes
 * themselves — next/script `afterInteractive` then executes from cache. The
 * preload's crossOrigin must match the executing <Script>'s, or the browser
 * fetches twice.
 */
export function AdsenseHeadHints(): ReactElement {
  return (
    <Head>
      {ADSENSE_PRECONNECT_ORIGINS.map((origin) => (
        <link key={origin} rel="preconnect" href={origin} crossOrigin="" />
      ))}
      <link
        rel="preload"
        as="script"
        href={ADSENSE_SCRIPT_SRC}
        crossOrigin="anonymous"
      />
    </Head>
  );
}
