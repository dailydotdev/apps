import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon } from '../../../components/icons';
import { useGivebackContext } from '../GivebackContext';

// Full-page gate. When Giveback is not available in the user's country we block
// the whole experience and only explain, at a high level, what the campaign is.
export const GeoGateFallback = (): ReactElement | null => {
  const { geoAvailability } = useGivebackContext();

  if (geoAvailability === 'available') {
    return null;
  }

  return (
    <div className="relative flex min-h-page w-full items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="bg-accent-cabbage-default/15 pointer-events-none absolute left-1/2 top-1/4 size-[32rem] -translate-x-1/2 rounded-full blur-3xl"
      />

      <FlexCol className="relative max-w-xl items-center gap-5 text-center">
        <FlexRow className="items-center gap-2 rounded-10 bg-surface-float px-3 py-1.5">
          <DailyIcon />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
            bold
          >
            Giveback by daily.dev
          </Typography>
        </FlexRow>

        <Typography
          bold
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
        >
          Giveback is not available in your country yet
        </Typography>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
        >
          Giveback turns part of our growth budget into donations for causes the
          community picks — funded by daily.dev, at no cost to you.
        </Typography>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          It&apos;s in beta and rolling out to more countries soon.
        </Typography>
      </FlexCol>
    </div>
  );
};
