import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { signupWallCover } from '../../../../lib/image';

type Focus = 'subject' | 'subjectHigh';

// =============================================================
// Landing hero cover — the artwork from the long variant of the
// marketing landing page: the dev and their dog at their tent,
// looking out over a glowing valley.
//
// `cover` fills whatever box it is given edge to edge (the stacked
// layout's top band). `panel` insets the same artwork in a rounded
// frame with an ambilight behind it (the split's right column).
// =============================================================

type LandingHeroCoverProps = {
  className?: string;
  variant?: 'cover' | 'panel';
  // renders a blurred, over-saturated copy of the artwork behind the frame, so
  // the panel throws its own colour onto the page
  ambilight?: boolean;
  // 'subject' frames the dev and the dog; 'subjectHigh' shows the same pair but
  // sat higher in the box, for a band whose lower half is under a fade.
  focus?: Focus;
  // Scales the artwork up around the focus point, so the dev and the dog read
  // at a usable size in a small box. The caller must clip.
  zoom?: boolean;
};

// The artwork is square with the pair low and left, so one position serves
// every subject crop: portrait columns crop horizontally (38% keeps them off
// the left edge) and taller boxes crop vertically (72% keeps them in frame).
const FOCUS_CROP: Record<Focus, string> = {
  subject: 'object-[38%_72%]',
  subjectHigh: 'object-[34%_92%]',
};

// Anchored on the same point the crop is centred on, so scaling up grows the
// pair in place rather than sliding them out of frame.
const ZOOM_CLASS: Record<Focus, string> = {
  subject: 'scale-[1.45] origin-[38%_72%]',
  subjectHigh: 'scale-[1.5] origin-[34%_92%]',
};

export const LandingHeroCover = ({
  className,
  variant = 'cover',
  ambilight = false,
  focus = 'subject',
  zoom = false,
}: LandingHeroCoverProps): ReactElement => {
  const isPanel = variant === 'panel';
  const cropClass = classNames(FOCUS_CROP[focus], zoom && ZOOM_CLASS[focus]);

  return (
    // no `relative` in the base: the cover variant is positioned by its caller
    // (absolute inset-0) and Tailwind's `.relative` would win over it
    <div
      aria-hidden
      className={classNames(
        'pointer-events-none select-none',
        isPanel && 'relative',
        className,
      )}
      data-testid="landing-hero-cover"
    >
      {isPanel && ambilight && (
        // sibling of the frame rather than a child: the frame paints its own
        // background, which would cover a negatively-stacked child
        <div
          className="onb-ambilight absolute -inset-2 overflow-hidden rounded-32"
          data-testid="hero-ambilight"
        >
          <img
            alt=""
            className={classNames('block size-full object-cover', cropClass)}
            decoding="async"
            src={signupWallCover}
          />
        </div>
      )}
      <div
        className={classNames(
          'h-full w-full',
          isPanel && 'onb-panel-frame relative rounded-32 p-2',
        )}
      >
        <div
          className={classNames(
            'h-full w-full',
            // the artwork carries the same 24px corner as the floating QR card,
            // and the frame is concentric with it: 32px outer minus the 8px inset
            isPanel && 'relative overflow-hidden rounded-24',
          )}
        >
          <img
            alt=""
            className={classNames('block size-full object-cover', cropClass)}
            decoding="async"
            fetchPriority="high"
            src={signupWallCover}
          />
        </div>
      </div>
    </div>
  );
};
