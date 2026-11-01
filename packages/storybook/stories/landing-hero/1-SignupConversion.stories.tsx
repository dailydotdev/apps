import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Gallery, Page, VariationPage } from './parts';
import { signupVariations } from './variations';

const CHAPTER = 'Chapter 1';
const GOAL =
  'More accounts from the same homepage visitors, without changing what the page is: the illustration, the inline signup and the demo stay.';
const METRIC =
  'Hero signup rate (provider click → account created). Guardrail: D7 retained accounts per exposed visitor.';

const meta: Meta = {
  title: 'Landing Hero/1. Signup conversion',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const story = (index: number): StoryObj => ({
  name: `${signupVariations[index].id} · ${signupVariations[index].title}`,
  render: () => (
    <VariationPage
      variation={signupVariations[index]}
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
      question="How do we get more of the same visitors to sign up?"
      title="Ten signup variations, laptop only"
      goal={GOAL}
      metric={METRIC}
    >
      <Gallery variations={signupVariations} />
    </Page>
  ),
};

export const A1 = story(0);
export const A2 = story(1);
export const A3 = story(2);
export const A4 = story(3);
export const A5 = story(4);
export const A6 = story(5);
export const A7 = story(6);
export const A8 = story(7);
export const A9 = story(8);
export const A10 = story(9);
