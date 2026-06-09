import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackBackground } from './GivebackBackground';
import { GivebackReveal } from './GivebackReveal';
import { GivebackHero } from './GivebackHero';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { GivebackLegalFooter } from './GivebackLegalFooter';

export const GivebackPage = (): ReactElement => {
  return (
    <div className="relative min-h-page w-full">
      <GivebackBackground />

      <FlexCol className="relative mx-auto w-full max-w-6xl gap-14 px-4 py-8 tablet:py-14">
        <GivebackReveal>
          <GivebackHero />
        </GivebackReveal>

        <GivebackReveal>
          <GivebackSponsorTiers />
        </GivebackReveal>

        <GivebackReveal>
          <GivebackLegalFooter />
        </GivebackReveal>
      </FlexCol>
    </div>
  );
};
