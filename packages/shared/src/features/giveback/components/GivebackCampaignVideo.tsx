import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { PlayIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { GIVEBACK_CHARM_IMAGE } from './GivebackMascot';

// Mockup: the real campaign video behind a lightweight click-to-play facade —
// we only swap in the player iframe on click, so the hero doesn't autoplay or
// load the heavy embed up front. The clip itself is a placeholder borrowed from
// another campaign, so instead of its (unrelated) thumbnail the poster shows the
// Giveback charm on the brand backdrop. Swap VIDEO_ID for the final film later.
const VIDEO_ID = 'GAIOnX3S2jg';
const START_SECONDS = 1;

// A dark, on-brand backdrop (page background + a soft cabbage glow from the top)
// so the charm — rendered with `mix-blend-screen` — reads as floating, exactly
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
                src={GIVEBACK_CHARM_IMAGE.src}
                alt=""
                aria-hidden
                loading="lazy"
                className="relative max-h-[80%] w-auto select-none object-contain mix-blend-screen transition-transform duration-500 motion-safe:group-hover:scale-105"
              />
            </span>

            <FlexRow className="bg-background-default/80 absolute left-3 top-3 items-center gap-1.5 rounded-8 px-2 py-1 backdrop-blur">
              <span className="size-1.5 rounded-full bg-accent-cabbage-default motion-safe:animate-glow-pulse" />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                bold
                className="uppercase tracking-wider"
              >
                Campaign video
              </Typography>
            </FlexRow>

            <span className="absolute inset-0 flex items-center justify-center">
              {/* Dark halo so the button keeps strong contrast even over the
                  bright parts of the charm. */}
              <span
                aria-hidden
                className="bg-overlay-primary-pepper absolute size-24 rounded-full blur-2xl"
              />
              <span className="relative flex size-14 items-center justify-center rounded-full bg-white shadow-2 ring-4 ring-white/40 transition-transform duration-200 group-hover:ring-white/60 motion-safe:group-hover:scale-110">
                <PlayIcon secondary size={IconSize.Size48} className="ml-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
    </FlexCol>
  );
};
