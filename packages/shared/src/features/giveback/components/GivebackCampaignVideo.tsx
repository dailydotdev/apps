import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import { FlexCol } from '../../../components/utilities/common';
import { PlayIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

// The campaign clip behind a lightweight click-to-play facade - the heavy embed
// only mounts on click, so the hero never autoplays or loads the iframe up
// front. The placeholder poster shows the Giveback charm on the brand backdrop;
// swap VIDEO_ID for the final film when it's ready.
const VIDEO_ID = 'GAIOnX3S2jg';
const START_SECONDS = 1;

const CHARM_IMAGE_SRC =
  'https://media.daily.dev/image/upload/s--d1dldAty--/f_auto,q_auto/v1780848838/public/daily.dev%20Charm%20-%20Giveback%20(1)';

// A dark, on-brand backdrop (page background + a soft cabbage glow from the top)
// so the charm - rendered with `mix-blend-screen` - reads as floating, exactly
// like it does elsewhere on the dark page.
const posterBackdrop: CSSProperties = {
  background:
    'radial-gradient(120% 95% at 50% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 22%, transparent), transparent 68%), var(--theme-background-default)',
};

export const GivebackCampaignVideo = (): ReactElement => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <FlexCol className="w-full gap-2">
      <div className="group relative aspect-video w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float">
        {isPlaying ? (
          <iframe
            title="Giveback campaign video"
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&start=${START_SECONDS}&rel=0`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label="Play the Giveback campaign video"
            className="absolute inset-0 size-full"
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={posterBackdrop}
            />

            {/* The charm as the poster: a soft glow behind it, then the artwork
                with the black baked-in background dropped via mix-blend-screen. */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden
                className="bg-accent-cabbage-default/20 absolute size-1/2 rounded-full blur-3xl motion-safe:animate-glow-pulse"
              />
              <img
                src={CHARM_IMAGE_SRC}
                alt=""
                aria-hidden
                loading="lazy"
                className="relative max-h-[80%] w-auto select-none object-contain mix-blend-screen transition-transform duration-500 motion-safe:group-hover:scale-105"
              />
            </span>

            <span className="absolute inset-0 flex items-center justify-center">
              {/* Dark halo so the button keeps strong contrast even over the
                  bright parts of the charm. */}
              <span
                aria-hidden
                className="absolute size-24 rounded-full bg-overlay-primary-pepper blur-2xl"
              />
              <span className="group-hover:ring-white/60 relative flex size-14 items-center justify-center rounded-full bg-white shadow-2 ring-4 ring-white/40 transition-transform duration-200 motion-safe:group-hover:scale-110">
                <PlayIcon secondary size={IconSize.Size48} className="ml-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
    </FlexCol>
  );
};
