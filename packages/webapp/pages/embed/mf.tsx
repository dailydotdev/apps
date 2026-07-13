import type { GetServerSideProps } from 'next';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { injectMeasurementTags } from '@dailydotdev/shared/src/features/monetization/measurementTags';
import {
  isMeasurementInitMessage,
  measurementFrameSource,
} from '@dailydotdev/shared/src/features/monetization/measurementFrame';

/**
 * Embed page that runs ad measurement tags on behalf of the extension, which
 * cannot run them on its own pages. The parent posts the tags via the
 * handshake defined in `measurementFrame.ts`. Kept bare (excluded from the app
 * shell in `_app.tsx`) so it loads fast.
 */

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // NEXT_PUBLIC_DAILY_EXTENSION_ID is inlined at build time (next.config.ts),
  // so the header stays correct even if the runtime env misses the raw ids.
  const chromeId =
    process.env.EXTENSION_ID_CHROME ||
    process.env.NEXT_PUBLIC_DAILY_EXTENSION_ID;
  const edgeId = process.env.EXTENSION_ID_EDGE;
  const operaId = process.env.EXTENSION_ID_OPERA;

  const frameAncestors = [
    "'self'",
    chromeId && `chrome-extension://${chromeId}`,
    edgeId && `chrome-extension://${edgeId}`,
    operaId && `chrome-extension://${operaId}`,
  ]
    .filter(Boolean)
    .join(' ');

  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);
  // Static per deploy; cache so a feed full of ads doesn't SSR it repeatedly.
  res.setHeader(
    'Cache-Control',
    'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  );

  return { props: {} };
};

/**
 * Only the window that frames this page may inject tags — `frame-ancestors`
 * above restricts that to our own origin and our extension ids. Any other
 * window holding a reference (e.g. an opener) is rejected, since its `init`
 * would execute arbitrary markup on our origin.
 */
const isTrustedEmbedder = (event: MessageEvent): boolean => {
  const { parent } = globalThis;
  if (parent === globalThis.window || event.source !== parent) {
    return false;
  }

  return (
    event.origin.startsWith('chrome-extension://') ||
    event.origin === globalThis.location?.origin
  );
};

export default function MeasurementFrame(): ReactElement {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedEmbedder(event) || !isMeasurementInitMessage(event.data)) {
        return;
      }

      const { tags, gdprApplies } = event.data;
      injectMeasurementTags(document.body, tags, { gdprApplies });
    };

    globalThis.addEventListener('message', onMessage);

    // Announce readiness so the parent posts `init` only once we can receive it.
    // No secrets in this message, so a wildcard target origin is safe.
    globalThis.parent?.postMessage(
      { source: measurementFrameSource, type: 'ready' },
      '*',
    );

    return () => globalThis.removeEventListener('message', onMessage);
  }, []);

  return (
    <>
      {/* Transparent so the frame never visually hides the card beneath it;
          the parent iframe is pointer-events:none so clicks pass through. */}
      <style>{'html,body{margin:0;background:transparent!important}'}</style>
      <div style={{ width: 0, height: 0 }} />
    </>
  );
}
