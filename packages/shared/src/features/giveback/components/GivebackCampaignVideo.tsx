import type { ReactElement, SyntheticEvent } from 'react';
import React, { useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { PlayIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

// Mockup: the real campaign video embedded through a lightweight click-to-play
// facade — we show the YouTube thumbnail with the play button and only swap in
// the player iframe on click, so the hero doesn't autoplay or load the heavy
// embed up front. Swap VIDEO_ID for the final film when it's ready.
const VIDEO_ID = 'GAIOnX3S2jg';
const VIDEO_TITLE = 'Are you hiring?';
const START_SECONDS = 1;

const handleThumbnailError = (
  event: SyntheticEvent<HTMLImageElement>,
): void => {
  const img = event.currentTarget;
  const fallback = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
  if (img.src !== fallback) {
    img.src = fallback;
  }
};

export const GivebackCampaignVideo = (): ReactElement => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <FlexCol className="gap-2">
      <div className="group relative aspect-video w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float">
        {isPlaying ? (
          <iframe
            title={VIDEO_TITLE}
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&start=${START_SECONDS}&rel=0`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play campaign video: ${VIDEO_TITLE}`}
            className="absolute inset-0 size-full"
          >
            <img
              src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
              alt=""
              aria-hidden
              loading="lazy"
              onError={handleThumbnailError}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-overlay-quaternary-pepper"
            />

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

            <FlexCol className="absolute inset-0 items-center justify-center gap-3 px-6 text-center">
              <span className="bg-background-default/90 flex size-16 items-center justify-center rounded-full shadow-2 transition-transform motion-safe:group-hover:scale-110">
                <PlayIcon
                  secondary
                  size={IconSize.XLarge}
                  className="ml-0.5 text-accent-cabbage-default"
                />
              </span>
              <FlexCol className="gap-0.5">
                <Typography bold type={TypographyType.Title3}>
                  {VIDEO_TITLE}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Watch the campaign
                </Typography>
              </FlexCol>
            </FlexCol>
          </button>
        )}
      </div>
    </FlexCol>
  );
};
