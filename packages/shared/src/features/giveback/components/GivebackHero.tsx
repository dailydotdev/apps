import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackStartPanel } from './GivebackStartPanel';
import { GivebackCampaignVideo } from './GivebackCampaignVideo';
import { GivebackFundingSummary } from './GivebackFundingSummary';

export const GivebackHero = (): ReactElement => {
  return (
    <section className="relative w-full">
      {/* Clip only the decorative glows, not the content, so hover effects on
          buttons (scale + shadow) aren't cut off by the section bounds. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-accent-cabbage-default/25 absolute -left-24 -top-24 size-80 rounded-full blur-3xl motion-safe:animate-glow-pulse" />
        <div
          className="bg-accent-onion-default/20 absolute -right-10 top-10 size-72 rounded-full blur-3xl motion-safe:animate-glow-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="bg-accent-cheese-default/15 absolute -bottom-16 left-1/3 size-64 rounded-full blur-3xl motion-safe:animate-glow-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <FlexCol className="relative gap-10 py-2">
        <FlexCol className="gap-2">
          <FlexRow className="mb-6 w-fit items-center gap-3">
            <Logo
              position={LogoPosition.Initial}
              logoClassName={{ container: 'h-6' }}
            />
            <span
              aria-hidden
              className="h-6 w-px bg-border-subtlest-tertiary"
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Title3}
              color={TypographyColor.Primary}
              bold
            >
              Giveback
            </Typography>
          </FlexRow>

          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title1}
            bold
            className="max-w-3xl"
          >
            Grow the community. Redirect the budget.
            <span className="block bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
              Fund good causes.
            </span>
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-2xl"
          >
            Ad giants don&apos;t need our money. The causes you care about do.
            We redirect our growth budget to them, and you never pay a cent.
          </Typography>
        </FlexCol>

        <div className="grid items-stretch gap-6 laptop:grid-cols-[1.45fr_1fr] laptop:gap-8">
          <GivebackCampaignVideo />

          <FlexCol className="h-full justify-center gap-5">
            <GivebackFundingSummary />
            <div className="via-accent-cabbage-default/30 h-px w-full bg-gradient-to-r from-transparent to-transparent" />
            <GivebackStartPanel />
          </FlexCol>
        </div>
      </FlexCol>
    </section>
  );
};
