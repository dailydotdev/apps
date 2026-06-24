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
import { GivebackFundingSummary } from './GivebackFundingSummary';

// The page cover: brand, headline, and the live funding meter folded into one
// block. No video or CTA here — the warm-up funnel handles onboarding — so the
// cover stays compact and the action tabs sit higher on the page.
export const GivebackHero = (): ReactElement => (
  <section className="relative w-full">
    {/* Clip only the decorative glows, not the content. */}
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

    <FlexCol className="relative gap-8 py-2">
      <FlexCol className="gap-2">
        <FlexRow className="mb-6 w-fit items-center gap-3">
          <Logo
            position={LogoPosition.Initial}
            logoClassName={{ container: 'h-6' }}
          />
          <span aria-hidden className="h-6 w-px bg-border-subtlest-tertiary" />
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
          className="max-w-3xl [text-wrap:balance]"
        >
          Do what you already do.
          <span className="block bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
            Fund what you actually care about.
          </span>
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-2xl"
        >
          Every action you take on daily.dev unlocks real money for good causes.
          We pay for all of it, you choose where it goes. No catch, no cost,
          just developers giving back together.
        </Typography>
      </FlexCol>

      <div className="w-full max-w-xl">
        <GivebackFundingSummary />
      </div>
    </FlexCol>
  </section>
);
