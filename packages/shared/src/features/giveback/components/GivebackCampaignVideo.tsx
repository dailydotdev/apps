import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { PlayIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

// Placeholder for the campaign video (CEO presenting the initiative), mirroring
// the lead media slot on Kickstarter-style pages. Swap the inner block for the
// real player/embed once the video is recorded — the 16:9 frame is ready.
export const GivebackCampaignVideo = (): ReactElement => (
  <FlexCol className="gap-2">
    <div className="from-accent-cabbage-default/25 to-accent-onion-default/25 group relative aspect-video w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-gradient-to-br via-surface-float">
      <div
        aria-hidden
        className="bg-accent-cheese-default/20 pointer-events-none absolute -bottom-16 -right-10 size-48 rounded-full blur-3xl"
      />

      <FlexRow className="bg-background-default/80 absolute left-3 top-3 items-center gap-1.5 rounded-8 px-2 py-1 backdrop-blur">
        <span className="size-1.5 rounded-full bg-accent-cabbage-default motion-safe:animate-glow-pulse" />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          bold
          className="uppercase tracking-wider"
        >
          Campaign video · coming soon
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
            Watch the campaign
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            2 minutes with our CEO on why we&apos;re doing this
          </Typography>
        </FlexCol>
      </FlexCol>
    </div>
  </FlexCol>
);
