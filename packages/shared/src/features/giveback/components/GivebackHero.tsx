import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackStartPanel } from './GivebackStartPanel';
import { GivebackCampaignVideo } from './GivebackCampaignVideo';
import { GivebackFundingSummary } from './GivebackFundingSummary';

export const GivebackHero = (): ReactElement => {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-24 -top-24 size-80 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent-onion-default/15 pointer-events-none absolute -right-10 top-10 size-72 rounded-full blur-3xl"
      />

      <FlexCol className="relative gap-10 py-2">
        <FlexCol className="gap-2">
          <FlexRow className="w-fit items-center gap-2 rounded-10 bg-surface-float px-3 py-1.5">
            <DailyIcon />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
              bold
            >
              Giveback by daily.dev
            </Typography>
          </FlexRow>

          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title1}
            bold
            className="max-w-3xl"
          >
            Grow the community. Redirect the budget.
            <span className="block bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
              Fund good causes.
            </span>
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-2xl"
          >
            Ad giants don&apos;t need our money — the causes you care about do.
            We redirect our growth budget to them, and you never pay a cent.
          </Typography>
        </FlexCol>

        <div className="grid items-center gap-6 laptop:grid-cols-[1.7fr_1fr] laptop:gap-10">
          <GivebackCampaignVideo />

          <FlexCol className="gap-5">
            <GivebackFundingSummary />
            <div className="border-t border-border-subtlest-tertiary" />
            <GivebackStartPanel />
          </FlexCol>
        </div>
      </FlexCol>
    </section>
  );
};
