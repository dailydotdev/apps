import type { CSSProperties, ReactElement, RefObject } from 'react';
import React, { useEffect, useState } from 'react';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/Button';
import CloseButton from '../../../components/CloseButton';
import { GivebackCampaignVideo } from './GivebackCampaignVideo';

// The campaign explainer that starts inline on step 1, then docks to a floating
// bottom-right player for the rest of the funnel. It is a SINGLE mounted
// instance positioned over an in-flow slot (step 1) or pinned to the corner
// (later steps), so playback never restarts when it moves.
const DOCK_WIDTH = 320;

interface GivebackFunnelVideoProps {
  slotRef: RefObject<HTMLDivElement>;
  docked: boolean;
  onClose: () => void;
}

export const GivebackFunnelVideo = ({
  slotRef,
  docked,
  onClose,
}: GivebackFunnelVideoProps): ReactElement | null => {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const update = () => {
      if (docked) {
        // Pin to the visual viewport (the actually-visible area), not
        // `window.innerWidth`/`innerHeight`. On Android the layout viewport can
        // be wider than the screen, and positioning this fixed player from it
        // drops the video off the right/bottom edge. The visual viewport always
        // tracks what the user sees, so the corner stays on-screen everywhere.
        const vv = window.visualViewport;
        const viewportWidth = vv?.width ?? window.innerWidth;
        const viewportHeight = vv?.height ?? window.innerHeight;
        const width = Math.min(DOCK_WIDTH, viewportWidth - 32);
        const height = (width * 9) / 16;
        setStyle({
          top: viewportHeight - height - 16,
          left: viewportWidth - width - 16,
          width,
        });
        return;
      }
      const el = slotRef.current;
      if (!el) {
        setStyle(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setStyle({ top: rect.top, left: rect.left, width: rect.width });
    };
    // Coalesce scroll/resize bursts into one measure per frame so the docked
    // player doesn't thrash getBoundingClientRect + setState on every event.
    let frame: number | null = null;
    const scheduleUpdate = () => {
      if (frame !== null) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    update();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);
    // The visual viewport changes as the mobile URL bar shows/hides without
    // firing a window resize, so track it too to keep the docked player pinned.
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('scroll', scheduleUpdate);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && slotRef.current) {
      observer = new ResizeObserver(scheduleUpdate);
      observer.observe(slotRef.current);
    }
    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('scroll', scheduleUpdate);
      observer?.disconnect();
    };
  }, [docked, slotRef]);

  if (!style) {
    return null;
  }

  return (
    <div
      className="z-10 fixed transition-[top,left,width] duration-500 ease-in-out motion-reduce:transition-none"
      style={style}
    >
      <div className="relative shadow-2">
        <GivebackCampaignVideo />
        {docked && (
          <CloseButton
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            className="absolute right-2 top-2 z-1"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
};
