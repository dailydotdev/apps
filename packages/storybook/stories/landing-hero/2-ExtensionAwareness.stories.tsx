import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Gallery, Page, VariationPage } from './parts';
import { extensionVariations } from './variations';

const CHAPTER = 'Chapter 2';
const GOAL =
  'Visitors learn the browser extension exists and more of them install it, without a second offer competing with the signup (the side-by-side column lost 16% of signups).';
const METRIC =
  'Store clicks and installs per exposed visitor. Guardrail: hero signup rate, read daily on Windows desktop first.';

const meta: Meta = {
  title: 'Landing Hero/2. Extension awareness',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const story = (index: number): StoryObj => ({
  name: `${extensionVariations[index].id} · ${extensionVariations[index].title}`,
  render: () => (
    <VariationPage
      variation={extensionVariations[index]}
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
      question="How do we tell visitors about the extension without losing signups?"
      title="Ten extension variations, laptop only"
      goal={GOAL}
      metric={METRIC}
    >
      <Gallery variations={extensionVariations} />
    </Page>
  ),
};

export const B1 = story(0);
export const B2 = story(1);
export const B3 = story(2);
export const B4 = story(3);
export const B5 = story(4);
export const B6 = story(5);
export const B7 = story(6);
export const B8 = story(7);
export const B9 = story(8);
export const B10 = story(9);
