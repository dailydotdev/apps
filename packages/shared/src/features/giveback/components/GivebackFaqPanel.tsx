import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackBudgetStory } from './GivebackBudgetStory';
import { GivebackFaq } from './GivebackFaq';

// The FAQ tab: the short, proud reason for the whole campaign up top (the
// headline rides beside the charm), then the answers to everything people ask.
const headline = {
  title: 'Big tech buys ads.',
  highlight: 'We fund developers.',
};

export const GivebackFaqPanel = (): ReactElement => (
  <FlexCol className="gap-10">
    <GivebackBudgetStory headline={headline} />
    <GivebackFaq />
  </FlexCol>
);
