import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Ad, AdMeasurementTag } from '../../../../graphql/posts';
import { isExtension } from '../../../../lib/func';
import { isTesting } from '../../../../lib/constants';
import { useIsLightTheme } from '../../../../hooks/utils/useThemedAsset';
import type { AdMacroContext } from '../../../../features/monetization/adMacros';
import { useAdMacroContext } from '../../../../features/monetization/useAdMacroContext';
import {
  injectMeasurementTags,
  tagsRequireOverlay,
} from '../../../../features/monetization/measurementTags';
import type { MeasurementTheme } from '../../../../features/monetization/measurementFrame';
import {
  getMeasurementFrameUrl,
  isMeasurementReadyMessage,
  measurementParentSource,
} from '../../../../features/monetization/measurementFrame';

interface PathProps {
  tags: AdMeasurementTag[];
  ctx: AdMacroContext | null;
  overlay: boolean;
  theme: MeasurementTheme;
}

// Overlay (viewability) must cover the card so the vendor measures the correct
// element; impression-only tags stay 0-size and hidden. Both are non-interactive
// so the native ad card keeps ownership of clicks. Positioned absolutely against
// the card's `relative` root.
const overlayClass = 'pointer-events-none absolute inset-0 size-full border-0';
const hiddenClass = 'pointer-events-none absolute size-0 border-0';

/**
 * Web path: the page CSP allows JS, so tags run inline in a container that
 * covers the card (overlay) or stays hidden (impression-only). No iframe cost.
 */
const InlineMeasurement = ({ tags, ctx, overlay }: PathProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx || !ref.current) {
      return;
    }

    injectMeasurementTags(ref.current, tags, ctx);
  }, [ctx, tags]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={overlay ? overlayClass : hiddenClass}
    />
  );
};

/**
 * Extension path: MV3 CSP forbids remote JS on the new-tab page, so tags run in
 * a single web-origin frame. The iframe starts loading as soon as the card is
 * near the viewport (in parallel with the consent read); `init` is posted once
 * both the frame is ready and consent resolved.
 */
const FramedMeasurement = ({
  tags,
  ctx,
  overlay,
  theme,
}: PathProps): ReactElement => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);
  const frameUrl = useMemo(getMeasurementFrameUrl, []);
  const frameOrigin = useMemo(() => new URL(frameUrl).origin, [frameUrl]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== frameOrigin) {
        return;
      }

      if (isMeasurementReadyMessage(event.data)) {
        setFrameReady(true);
      }
    };

    globalThis.addEventListener('message', onMessage);
    return () => globalThis.removeEventListener('message', onMessage);
  }, [frameOrigin]);

  useEffect(() => {
    if (!frameReady || !ctx) {
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      { source: measurementParentSource, type: 'init', tags, ctx, theme },
      frameOrigin,
    );
  }, [frameReady, ctx, tags, theme, frameOrigin]);

  return (
    <iframe
      ref={iframeRef}
      src={frameUrl}
      title="measurement"
      aria-hidden
      tabIndex={-1}
      scrolling="no"
      // Real origin (daily.dev) so vendor scripts keep their storage/cookies;
      // cross-origin to the extension page, so the extension stays isolated.
      sandbox="allow-scripts allow-same-origin"
      className={overlay ? overlayClass : hiddenClass}
    />
  );
};

/**
 * Renders an ad's third-party measurement tags (DoubleVerify / CM360 JS).
 * Image impression pixels stay on `AdPixel`; this handles only JS-based tags,
 * which run inline on web and inside a web-origin frame on the extension.
 */
export const AdMeasurement = ({ ad }: { ad: Ad }): ReactElement | null => {
  const { tags } = ad;
  const hasTags = !!tags?.length;
  const overlay = useMemo(() => tagsRequireOverlay(tags), [tags]);
  const theme: MeasurementTheme = useIsLightTheme() ? 'light' : 'dark';

  // Pre-warm ~300px before the card enters view so measurement is ready the
  // moment it becomes visible, without loading frames for far-off ads.
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '300px',
    initialInView: isTesting,
    fallbackInView: true,
  });

  const ctx = useAdMacroContext(inView && hasTags);

  if (!hasTags) {
    return null;
  }

  return (
    <span ref={ref} className="size-0">
      {inView &&
        (isExtension ? (
          <FramedMeasurement
            tags={tags}
            ctx={ctx}
            overlay={overlay}
            theme={theme}
          />
        ) : (
          <InlineMeasurement
            tags={tags}
            ctx={ctx}
            overlay={overlay}
            theme={theme}
          />
        ))}
    </span>
  );
};
