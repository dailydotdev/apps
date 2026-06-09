import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackHeadline } from './GivebackHeadline';
import { GivebackMascot, GivebackMascotMood } from './GivebackMascot';

interface BudgetRedirectStoryProps {
  headline: { title: string; highlight: string };
}

// "Why we do it" — kept short and emotional. The headline + reason stack in a
// left column with the charm beside both as the "genie" who grants the
// community's wishes, so the row stays tight with no empty space top/bottom.
export const BudgetRedirectStory = ({
  headline,
}: BudgetRedirectStoryProps): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <GivebackSection id="giveback-why">
      <FlexRow className="flex-col-reverse items-center gap-6 tablet:flex-row tablet:items-start tablet:gap-10">
        <FlexCol className="gap-4 tablet:flex-1">
          <GivebackHeadline {...headline} />
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            className="max-w-md"
          >
            {formatDonationAmount(campaign.goalAmount, campaign.currency)} goes
            straight to the causes you pick: scholarships, open source, and
            access to tech. We could have spent it on ads. We would rather let
            the community decide what its work is worth.
          </Typography>
        </FlexCol>
        <GivebackMascot
          mood={GivebackMascotMood.Thoughtful}
          className="shrink-0 tablet:ml-auto tablet:items-end"
        />
      </FlexRow>
    </GivebackSection>
  );
};
