import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackBackground } from './GivebackBackground';
import { GivebackReveal } from './GivebackReveal';
import { GivebackHero } from './GivebackHero';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import { GivebackLegalFooter } from './GivebackLegalFooter';

export const GivebackPage = (): ReactElement => {
  // Picking causes is the onboarding step: it only appears once an
  // authenticated visitor opts in from the hero.
  const [hasStarted, setHasStarted] = useState(false);
  const causesRef = useRef<HTMLDivElement>(null);

  const handleJoin = useCallback(() => setHasStarted(true), []);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }
    const node = causesRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasStarted]);

  return (
    <div className="relative min-h-page w-full">
      <GivebackBackground />

      <FlexCol className="relative mx-auto w-full max-w-6xl gap-14 px-4 py-8 tablet:py-14">
        <GivebackReveal>
          <GivebackHero onJoin={handleJoin} />
        </GivebackReveal>

        <GivebackReveal>
          <GivebackSponsorTiers />
        </GivebackReveal>

        {hasStarted && (
          <div ref={causesRef} className="scroll-mt-16">
            <GivebackReveal>
              <FlexCol className="gap-6">
                <FlexCol className="gap-2">
                  <Typography
                    tag={TypographyTag.H2}
                    type={TypographyType.Title2}
                    bold
                  >
                    Pick the causes you care about
                  </Typography>
                  <Typography
                    tag={TypographyTag.P}
                    type={TypographyType.Callout}
                    color={TypographyColor.Secondary}
                  >
                    Your actions fund the causes you choose. We fund developers,
                    not ads.
                  </Typography>
                </FlexCol>
                <GivebackCauseSelection />
              </FlexCol>
            </GivebackReveal>
          </div>
        )}

        <GivebackReveal>
          <GivebackLegalFooter />
        </GivebackReveal>
      </FlexCol>
    </div>
  );
};
