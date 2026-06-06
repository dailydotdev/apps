import type { ReactElement } from 'react';
import React from 'react';
import { FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackMascot, GivebackMascotMood } from './GivebackMascot';

// "Why we do it" — kept short and emotional. The community contribution speaks
// for itself; this is just the one-line reason behind it. The charm sits beside
// the reason as the "genie" who grants the community's wishes.
export const BudgetRedirectStory = (): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <GivebackSection id="giveback-why">
      <FlexRow className="flex-col-reverse items-center gap-6 tablet:flex-row tablet:items-center tablet:gap-10">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          className="max-w-2xl tablet:flex-1"
        >
          {formatDonationAmount(campaign.goalAmount, campaign.currency)} goes
          straight to the causes you pick: scholarships, open source, and access
          to tech. We could have spent it on ads. We would rather let the
          community decide what its work is worth.
        </Typography>
        <GivebackMascot
          mood={GivebackMascotMood.Thoughtful}
          speech="Pick a cause. We grant the rest."
          className="shrink-0"
        />
      </FlexRow>
    </GivebackSection>
  );
};
