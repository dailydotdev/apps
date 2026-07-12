import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { FlexCol } from '../../../components/utilities';
import { PlayIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { cloudinaryGivebackCampaignVideoPoster } from '../../../lib/image';

const VIDEO_ID = 'kDTf2R-OMnM';

export const GivebackCampaignVideo = (): ReactElement => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <FlexCol className="w-full gap-2">
      <div className="group relative aspect-video w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float">
        {isPlaying ? (
          <iframe
            title="Giveback campaign video"
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
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
            {/* Full-bleed poster: the composed thumbnail fills the 16:9 frame. */}
            <img
              src={cloudinaryGivebackCampaignVideoPoster}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 size-full select-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />

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
