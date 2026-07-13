import type { GetServerSideProps } from 'next';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { injectMeasurementTags } from '@dailydotdev/shared/src/features/monetization/measurementTags';
import { readAdConsent } from '@dailydotdev/shared/src/features/monetization/adConsent';
import {
  isMeasurementInitMessage,
  measurementFrameSource,
} from '@dailydotdev/shared/src/features/monetization/measurementFrame';

/**
 * Web-origin measurement frame. The extension's MV3 CSP forbids remote JS on its
 * own new-tab page, so DoubleVerify / CM360 JS tags run here instead, inside a
 * cross-origin iframe whose CSP we control. The page is intentionally bare and
 * excluded from the app shell in `_app.tsx` so it loads as fast as possible.
 *
 * All macro logic (consent read, cachebuster, substitution) lives here rather
 * than in the extension, so bugs are fixed with a webapp deploy instead of
 * waiting for extension-store adoption. The parent only sends raw tags + theme
 * + a geo hint.
 *
 * The route is `/mf` (no "ad"/"measurement" tokens) so ad blockers don't key on
 * the URL. Framing is locked to our extension origins via `frame-ancestors`.
 */

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const chromeId = process.env.EXTENSION_ID_CHROME;
  const edgeId = process.env.EXTENSION_ID_EDGE;

  const frameAncestors = [
    "'self'",
    chromeId && `chrome-extension://${chromeId}`,
    edgeId && `chrome-extension://${edgeId}`,
  ]
    .filter(Boolean)
    .join(' ');

  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);

  return { props: {} };
};

const isTrustedEmbedder = (origin: string): boolean =>
  origin.startsWith('chrome-extension://') ||
  origin === globalThis.location?.origin;

export default function MeasurementFrame(): ReactElement {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        !isTrustedEmbedder(event.origin) ||
        !isMeasurementInitMessage(event.data)
      ) {
        return;
      }

      const { tags, theme, gdprApplies } = event.data;
      if (theme) {
        document.documentElement.dataset.theme = theme;
      }

      // Consent is read here (web origin) so the whole pipeline is deployable
      // with the webapp; the geo hint only seeds gdprApplies when no CMP answers.
      readAdConsent(gdprApplies).then((ctx) => {
        injectMeasurementTags(document.body, tags, ctx);
      });
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
      {/* Transparent so an overlay (viewability) frame never hides the card
          beneath it; the parent iframe is pointer-events:none so clicks pass
          through to the native card regardless. */}
      <style>{'html,body{margin:0;background:transparent!important}'}</style>
      <div style={{ width: 0, height: 0 }} />
    </>
  );
}
