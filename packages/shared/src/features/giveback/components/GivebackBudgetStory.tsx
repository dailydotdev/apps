import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { GivebackSection } from './GivebackSection';
import { GivebackHeadline } from './GivebackHeadline';
import { GivebackMascot } from './GivebackMascot';

interface GivebackBudgetStoryProps {
  headline: { title: string; highlight: string };
}

// The FAQ tab's hero cover: the campaign's reason as the single primary title,
// with the charm beside it on the right. No supporting paragraph - the headline
// is the message; the answers below carry the detail.
export const GivebackBudgetStory = ({
  headline,
}: GivebackBudgetStoryProps): ReactElement => (
  <GivebackSection id="giveback-why">
    <FlexRow className="flex-col-reverse items-center gap-6 tablet:flex-row tablet:items-center tablet:gap-10">
      <FlexCol className="tablet:flex-1">
        <GivebackHeadline {...headline} />
      </FlexCol>
      <GivebackMascot className="shrink-0 tablet:ml-auto tablet:items-end" />
    </FlexRow>
  </GivebackSection>
);
