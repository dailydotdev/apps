import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Ad, AdMeasurementTag } from '../../../../graphql/posts';
import { isExtension } from '../../../../lib/func';
import { isTesting } from '../../../../lib/constants';
import type { AdMacroContext } from '../../../../features/monetization/adMacros';
import { useAdMacroContext } from '../../../../features/monetization/useAdMacroContext';
import {
  injectMeasurementTags,
  tagsRequireOverlay,
} from '../../../../features/monetization/measurementTags';
import {
  getMeasurementFrameUrl,
  isMeasurementReadyMessage,
  measurementParentSource,
} from '../../../../features/monetization/measurementFrame';

// Overlay tags must cover the card so viewability is measured against the
// right element; the rest stay 0-size. Both are non-interactive so the card
// keeps ownership of clicks. Positioned against the card's `relative` root.
const overlayClass = 'pointer-events-none absolute inset-0 size-full border-0';
const hiddenClass = 'pointer-events-none absolute size-0 border-0';

interface InlineProps {
  tags: AdMeasurementTag[];
  ctx: AdMacroContext | null;
  overlay: boolean;
}

const InlineMeasurement = ({
  tags,
  ctx,
  overlay,
}: InlineProps): ReactElement => {
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

interface FramedProps {
  tags: AdMeasurementTag[];
  overlay: boolean;
  gdprApplies?: boolean;
}

/**
 * Extension path: tags run in an embed page on our web origin (see
 * `measurementFrame.ts` for the handshake). The iframe starts loading as soon
 * as the card nears the viewport; `init` is posted once the frame reports ready.
 */
const FramedMeasurement = ({
  tags,
  overlay,
  gdprApplies,
}: FramedProps): ReactElement => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);
  const frameUrl = useMemo(getMeasurementFrameUrl, []);
  const frameOrigin = useMemo(() => new URL(frameUrl).origin, [frameUrl]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Every ad card mounts its own frame on the same origin, so match the
      // exact window too — another card's `ready` must not fire `init` at a
      // frame that can't receive it yet (it would be silently dropped).
      if (
        event.origin !== frameOrigin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
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
    if (!frameReady) {
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      {
        source: measurementParentSource,
        type: 'init',
        tags,
        gdprApplies,
      },
      frameOrigin,
    );
  }, [frameReady, tags, gdprApplies, frameOrigin]);

  return (
    <iframe
      ref={iframeRef}
      src={frameUrl}
      title="measurement"
      aria-hidden
      tabIndex={-1}
      scrolling="no"
      sandbox="allow-scripts allow-same-origin"
      className={overlay ? overlayClass : hiddenClass}
    />
  );
};

/**
 * Renders an ad's measurement tags. Image impression pixels stay on `AdPixel`;
 * this handles the JS-based tags, inline on web and in an embed frame on the
 * extension.
 */
export const AdMeasurement = ({ ad }: { ad: Ad }): ReactElement | null => {
  const { tags } = ad;
  const hasTags = !!tags?.length;
  const overlay = useMemo(() => tagsRequireOverlay(tags), [tags]);

  // Impression tags fire on injection, not on visibility, so only inject once
  // the card nears the viewport (~300px pre-warm keeps measurement ready in
  // time without loading tags for ads that are never seen).
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
            overlay={overlay}
            gdprApplies={ctx?.gdprApplies}
          />
        ) : (
          <InlineMeasurement tags={tags} ctx={ctx} overlay={overlay} />
        ))}
    </span>
  );
};
