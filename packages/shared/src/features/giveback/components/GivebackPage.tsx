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
import { GivebackBackground } from './GivebackBackground';
import { GivebackHeadline } from './GivebackHeadline';
import { GivebackMascot } from './GivebackMascot';
import { GivebackLegalFooter } from './GivebackLegalFooter';

// Single source of truth for the page gutter so every row lines up at the exact
// same left/right padding. Scales up on wider screens so content isn't
// edge-tight.
const column = 'mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12';

// The Giveback campaign is over. This page is what's left: a thank-you note. It
// stays public (no flag, no geo gate) so every old link, share card and
// bookmark lands somewhere that explains how the campaign ended.
//
// The by-cause split used to render here, but the API dropped the whole
// contribution schema, so there is no endpoint left to read it from.
export const GivebackPage = (): ReactElement => (
  <div className="relative min-h-page w-full">
    <GivebackBackground />

    <FlexCol className="relative gap-8 py-6 tablet:gap-10 tablet:py-8">
      <section className={column}>
        <FlexCol className="gap-8 py-2">
          <FlexRow className="items-center gap-2 tablet:gap-3">
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
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="rounded-10 bg-surface-float px-2 py-1"
            >
              Campaign closed
            </Typography>
          </FlexRow>

          <FlexRow className="flex-col-reverse items-start gap-8 tablet:flex-row tablet:items-center tablet:gap-10">
            <FlexCol className="w-full gap-4 tablet:flex-1">
              <GivebackHeadline
                title="That's a wrap."
                highlight="Thank you for giving back."
              />
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="max-w-2xl [text-wrap:pretty]"
              >
                Giveback has ended. You helped more developers discover
                daily.dev, and every action you took turned part of our growth
                budget into a real donation. The funds are on their way to the
                causes you picked.
              </Typography>
            </FlexCol>

            <GivebackMascot
              className="relative z-1 shrink-0 tablet:ml-auto"
              imageClassName="h-32 drop-shadow-2xl tablet:h-72"
            />
          </FlexRow>
        </FlexCol>
      </section>

      <div className={column}>
        <GivebackLegalFooter />
      </div>
    </FlexCol>
  </div>
);
