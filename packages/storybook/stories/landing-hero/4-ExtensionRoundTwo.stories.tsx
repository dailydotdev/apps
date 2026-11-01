import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Gallery2, Page, VariationPage2 } from './parts';
import { extensionRoundTwo } from './variations2';

const CHAPTER = 'Chapter 4';
const GOAL =
  'More developers on the new tab, sold as what they gain (the feed comes to them) rather than as a feature, without a second offer competing with the signup.';
const METRIC =
  'Account + extension within 7 days per exposed visitor. Guardrail: hero signup rate, read daily on Windows desktop first.';

const meta: Meta = {
  title: 'Landing Hero/4. Extension, round 2',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const story = (index: number): StoryObj => ({
  name: `${extensionRoundTwo[index].id} · ${extensionRoundTwo[index].title}`,
  render: () => (
    <VariationPage2
      variation={extensionRoundTwo[index]}
      chapter={CHAPTER}
      goal={GOAL}
      metric={METRIC}
    />
  ),
});

export const Overview: StoryObj = {
  name: 'All ten',
  render: () => (
    <Page
      chapter={CHAPTER}
      question="How do extension companies sell the surface, and how do we do it without losing signups?"
      title="Twelve extension variations, round two"
      goal={GOAL}
      metric={METRIC}
    >
      <Gallery2 variations={extensionRoundTwo} />
    </Page>
  ),
};

export const E1 = story(0);
export const E2 = story(1);
export const E3 = story(2);
export const E4 = story(3);
export const E5 = story(4);
export const E6 = story(5);
export const E7 = story(6);
export const E8 = story(7);
export const E9 = story(8);
export const E10 = story(9);
export const E11 = story(10);
export const E12 = story(11);
