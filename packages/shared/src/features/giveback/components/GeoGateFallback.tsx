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
import { cloudinaryGivebackPunchyStaring } from '../../../lib/image';

// Full-page gate. When Giveback isn't enabled for the visitor's region we block
// the whole experience and only explain, at a high level, what the campaign is.
// The gate decision (status.enabled) lives in GivebackPage - this is purely
// presentational so it can be rendered without the campaign queries.
export const GeoGateFallback = (): ReactElement => {
  return (
    <div className="relative flex min-h-page w-full items-center justify-center overflow-hidden px-4 py-12 tablet:px-6 tablet:py-16">
      <div
        aria-hidden
        className="bg-accent-cabbage-default/15 pointer-events-none absolute left-1/2 top-1/4 size-[20rem] -translate-x-1/2 rounded-full blur-3xl tablet:size-[32rem]"
      />

      <FlexCol className="relative w-full max-w-xl items-center gap-4 text-center tablet:gap-5">
        <img
          src={cloudinaryGivebackPunchyStaring}
          alt="Punchy, the daily.dev mascot, looking on hopefully"
          loading="lazy"
          className="aspect-square h-20 w-auto select-none object-contain tablet:h-24"
        />

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
          type={TypographyType.Title2}
          className="[text-wrap:balance] tablet:typo-title1 laptop:typo-large-title"
        >
          Giveback is not available in your country yet
        </Typography>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="[text-wrap:pretty] tablet:typo-title3"
        >
          Giveback turns part of our growth budget into donations for causes the
          community picks, funded by daily.dev, at no cost to you.
        </Typography>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="[text-wrap:pretty] tablet:typo-callout"
        >
          It&apos;s in beta and rolling out to more countries soon.
        </Typography>
      </FlexCol>
    </div>
  );
};
