import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { GivebackSection } from './GivebackSection';

// "Why we do it" — kept short and emotional. The community contribution speaks
// for itself; this is just the one-line reason behind it.
export const BudgetRedirectStory = (): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <GivebackSection id="giveback-why" title="We'd rather fund you than ads">
      <FlexCol className="gap-3">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Title2}
          className="max-w-3xl"
        >
          Big tech burns billions just to get noticed. We&apos;re taking part of
          that budget and putting it where it{' '}
          <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
            actually changes lives
          </span>
          .
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-2xl"
        >
          {formatDonationAmount(campaign.goalAmount, campaign.currency)} for the
          causes developers pick — scholarships, open source, and access to
          tech. Not a marketing campaign. A community deciding what its work is
          worth.
        </Typography>
      </FlexCol>
    </GivebackSection>
  );
};
