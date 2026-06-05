import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useGivebackNav } from '../GivebackNavContext';
import { GivebackTrustPerks } from './GivebackTrustPerks';
import { GivebackReveal } from './GivebackReveal';

export const GivebackClosingCta = (): ReactElement => {
  const { setActiveTab } = useGivebackNav();

  return (
    <section className="relative w-full overflow-hidden border-t border-border-subtlest-tertiary pt-8">
      {/* Layered, slowly breathing glows give the finale depth and life. */}
      <div
        aria-hidden
        className="bg-accent-cabbage-default/20 pointer-events-none absolute left-1/2 top-0 size-[26rem] -translate-x-1/2 rounded-full blur-3xl motion-safe:animate-glow-pulse"
      />
      <div
        aria-hidden
        className="bg-accent-avocado-default/10 pointer-events-none absolute -left-10 top-10 size-64 rounded-full blur-3xl motion-safe:animate-glow-pulse"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        aria-hidden
        className="bg-accent-cheese-default/10 pointer-events-none absolute -right-10 top-10 size-64 rounded-full blur-3xl motion-safe:animate-glow-pulse"
        style={{ animationDelay: '0.75s' }}
      />

      <FlexCol className="relative items-center gap-5 py-8 text-center">
        <GivebackReveal>
          <FlexRow className="items-center gap-2">
            <span className="relative flex size-2">
              <span className="bg-accent-cabbage-default/60 absolute inline-flex size-full rounded-full motion-safe:animate-glow-pulse" />
              <span className="relative inline-flex size-2 rounded-full bg-accent-cabbage-default" />
            </span>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              Ready when you are
            </Typography>
          </FlexRow>
        </GivebackReveal>

        <GivebackReveal delay={80}>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Mega2}
            bold
            className="max-w-3xl"
          >
            Turn small actions into{' '}
            <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-gradient-pan">
              real donations.
            </span>
          </Typography>
        </GivebackReveal>

        <GivebackReveal delay={160}>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            className="max-w-2xl"
          >
            Pick the causes you care about, do the dev work you already do, and
            the money lands where it matters. You never pay a cent.
          </Typography>
        </GivebackReveal>

        <GivebackReveal delay={240}>
          <FlexRow className="flex-wrap justify-center gap-3 pt-1">
            <Button
              type="button"
              onClick={() => setActiveTab('actions')}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              className="shadow-2-cabbage transition-transform duration-200 hover:scale-[1.03] active:scale-100 motion-reduce:transform-none"
            >
              Take action
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab('why')}
              variant={ButtonVariant.Float}
              size={ButtonSize.Large}
              className="transition-transform duration-200 hover:scale-[1.03] active:scale-100 motion-reduce:transform-none"
            >
              Why we do it
            </Button>
          </FlexRow>
        </GivebackReveal>

        <GivebackReveal delay={320}>
          <GivebackTrustPerks className="justify-center pt-1" />
        </GivebackReveal>
      </FlexCol>
    </section>
  );
};
