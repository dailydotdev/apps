import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { GivebackSection } from './GivebackSection';

// "Why we do it" — kept short and emotional. The community contribution speaks
// for itself; this is just the one-line reason behind it.
export const BudgetRedirectStory = (): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <GivebackSection id="giveback-why">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="max-w-2xl"
      >
        {formatDonationAmount(campaign.goalAmount, campaign.currency)} going to
        the causes you pick — scholarships, open source, and access to tech. Not
        a marketing campaign. A community deciding what its work is worth.
      </Typography>
    </GivebackSection>
  );
};
