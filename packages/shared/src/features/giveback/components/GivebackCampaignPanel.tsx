import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackBudgetStory } from './GivebackBudgetStory';
import { GivebackSelectedCauses } from './GivebackSelectedCauses';
import { GivebackFaq } from './GivebackFaq';

// The Campaign tab ("why"): the short emotional reason for the campaign with the
// charm, the visitor's picked causes (editable), and the FAQ. The big two-part
// headline rides inside the story so it sits beside the charm.
const headline = {
  title: 'Big tech buys ads.',
  highlight: 'We fund developers.',
};

export const GivebackCampaignPanel = (): ReactElement => (
  <FlexCol className="gap-8">
    <GivebackBudgetStory headline={headline} />
    <GivebackSelectedCauses />
    <GivebackFaq />
  </FlexCol>
);
