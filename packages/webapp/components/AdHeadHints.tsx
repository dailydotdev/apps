import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import {
  KUEEZ_PRECONNECT_ORIGINS,
  PREBID_SCRIPT_SRC,
} from '@dailydotdev/shared/src/features/monetization/kueez';

/**
 * Warms the ad path while the app is still hydrating: connections to the
 * Kueez origins the first auction will touch, plus the Prebid bundle itself,
 * which next/script `afterInteractive` then executes from cache.
 *
 * The bundle is same-origin, so it needs no crossOrigin and must not carry
 * one: a preload whose crossOrigin does not match the executing <Script> is
 * fetched twice.
 */
export function AdHeadHints(): ReactElement {
  return (
    <Head>
      {KUEEZ_PRECONNECT_ORIGINS.map((origin) => (
        <link key={origin} rel="preconnect" href={origin} crossOrigin="" />
      ))}
      <link rel="preload" as="script" href={PREBID_SCRIPT_SRC} />
    </Head>
  );
}
