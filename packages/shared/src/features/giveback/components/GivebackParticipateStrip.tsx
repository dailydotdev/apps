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
import { StarIcon } from '../../../components/icons';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { formatDonationAmount } from '../utils';

// Compact personal-status strip that sits right under the community campaign.
// The contribution starts at zero — it's the nudge to take a first action.
export const GivebackParticipateStrip = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();

  const contribution = 0;
  const hasContributed = contribution > 0;

  return (
    <section className="w-full rounded-16 bg-accent-cabbage-flat p-4 tablet:p-5">
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <FlexCol className="gap-1">
          <FlexRow className="items-baseline gap-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              Your contribution
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Title2}
              color={
                hasContributed
                  ? TypographyColor.StatusSuccess
                  : TypographyColor.Primary
              }
              bold
              className="inline-block motion-safe:animate-reward-pop"
            >
              {formatDonationAmount(contribution, campaign.currency)}
            </Typography>
          </FlexRow>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="max-w-xl"
          >
            {hasContributed
              ? `You've unlocked ${formatDonationAmount(
                  contribution,
                  campaign.currency,
                )} in donations — keep the momentum going.`
              : 'Start your first contribution — it costs you nothing. You give back, we give back.'}
          </Typography>
        </FlexCol>

        <FlexRow className="shrink-0 items-center gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<StarIcon />}
            onClick={() => setActiveTab('actions')}
          >
            Start contributing
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Medium}
            onClick={() => setActiveTab('why')}
          >
            Why we do it
          </Button>
        </FlexRow>
      </div>
    </section>
  );
};
