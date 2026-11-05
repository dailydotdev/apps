import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Gallery2, Page, VariationPage2 } from './parts';
import { signupRoundTwo } from './variations2';

const CHAPTER = 'Chapter 3';
const GOAL =
  'More accounts from the same visitors, built on what the big doors do (window, wall, packs, one tap) and on Nikita Bier’s rules, not on more copy in the column.';
const METRIC =
  'Hero signup rate (provider click → account). Guardrail: D7 retained accounts per exposed visitor, login success.';

const meta: Meta = {
  title: 'Landing Hero/3. Signup, round 2',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const story = (index: number): StoryObj => ({
  name: `${signupRoundTwo[index].id} · ${signupRoundTwo[index].title}`,
  render: () => (
    <VariationPage2
      variation={signupRoundTwo[index]}
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
      question="What do the platforms that win at signup actually do, and which of it fits us?"
      title="Ten signup variations, round two"
      goal={GOAL}
      metric={METRIC}
    >
      <Gallery2 variations={signupRoundTwo} />
    </Page>
  ),
};

export const S1 = story(0);
export const S2 = story(1);
export const S3 = story(2);
export const S4 = story(3);
export const S5 = story(4);
export const S6 = story(5);
export const S7 = story(6);
export const S8 = story(7);
export const S9 = story(8);
export const S10 = story(9);
