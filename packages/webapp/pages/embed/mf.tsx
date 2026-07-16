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
 * handshake defined in `measurementFrame.ts`.
 *
 * Load path is tuned end to end: the page is fully static (no data fetching,
 * so it prerenders and serves from cache), it is excluded from the app shell
 * in `_app.tsx`, and the inline script below runs the handshake at document
 * parse so the parent's `init` arrives while the page JS is still loading.
 * Framing is restricted via the `frame-ancestors` header in `next.config.ts`.
 */

type EarlyHandshakeWindow = typeof globalThis & {
  ddmfQueue?: MessageEvent[];
  ddmfEarly?: (event: MessageEvent) => void;
};

// Executes at document parse, long before hydration: buffer incoming messages
// and announce readiness immediately so the round-trip overlaps the JS load.
const earlyHandshakeScript =
  'window.ddmfQueue=[];' +
  'window.ddmfEarly=function(e){window.ddmfQueue.push(e)};' +
  'window.addEventListener("message",window.ddmfEarly);' +
  `window.parent!==window&&window.parent.postMessage({source:"${measurementFrameSource}",type:"ready"},"*");`;

/**
 * Only the window that frames this page may inject tags — `frame-ancestors`
 * restricts that to our own origin and our extension ids. Any other window
 * holding a reference (e.g. an opener) is rejected, since its `init` would
 * execute arbitrary markup on our origin.
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

    // Take over from the early inline listener and drain anything it buffered
    // (validation runs here — queued events keep their source/origin).
    const early = globalThis as EarlyHandshakeWindow;
    if (early.ddmfEarly) {
      globalThis.removeEventListener('message', early.ddmfEarly);
      delete early.ddmfEarly;
    }
    early.ddmfQueue?.forEach(onMessage);
    delete early.ddmfQueue;

    // Repeat `ready` as a fallback for the early script; a duplicate is
    // harmless on the parent side. No secrets, so wildcard target is safe.
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
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: earlyHandshakeScript }}
      />
      <div style={{ width: 0, height: 0 }} />
    </>
  );
}
