import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackHeadline } from './GivebackHeadline';
import { GivebackFundingSummary } from './GivebackFundingSummary';
import { GivebackMascot } from './GivebackMascot';

interface GivebackHeroProps {
  // Re-opens the warm-up funnel; rendered top-right next to the brand.
  onHowItWorks?: () => void;
}

// The page cover: brand + "how it works" across the top, then the campaign's
// reason as the headline with the live funding meter on the left and the charm
// on the right.
export const GivebackHero = ({
  onHowItWorks,
}: GivebackHeroProps): ReactElement => (
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
    </div>

    <FlexCol className="relative gap-8 py-2">
      <FlexRow className="items-center justify-between gap-3">
        <FlexRow className="min-w-0 items-center gap-2 tablet:gap-3">
          <Logo
            position={LogoPosition.Initial}
            logoClassName={{ container: 'h-4 tablet:h-6' }}
          />
          <span
            aria-hidden
            className="h-4 w-px bg-border-subtlest-tertiary tablet:h-6"
          />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
            className="truncate tablet:typo-title3"
          >
            Giveback
          </Typography>
        </FlexRow>

        {onHowItWorks && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            className="shrink-0"
            onClick={onHowItWorks}
          >
            How it works
          </Button>
        )}
      </FlexRow>

      <FlexRow className="flex-col-reverse items-start gap-8 tablet:flex-row tablet:items-center tablet:gap-10">
        <FlexCol className="w-full gap-6 tablet:flex-1">
          <FlexCol className="gap-2">
            <GivebackHeadline
              title="Big tech buys ads."
              highlight="We fund the causes you pick."
            />
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
              className="max-w-2xl [text-wrap:pretty]"
            >
              Instead of pouring our growth budget into ad networks, we put it
              toward causes that matter. You take a few small actions to help us
              grow; we turn every one into a real donation to the causes you
              choose. You never pay a cent.
            </Typography>
          </FlexCol>

          <div className="w-full max-w-sm">
            <GivebackFundingSummary />
          </div>
        </FlexCol>

        <GivebackMascot
          className="relative z-1 shrink-0 tablet:ml-auto"
          imageClassName="h-32 drop-shadow-2xl tablet:h-72"
        />
      </FlexRow>
    </FlexCol>
  </section>
);
