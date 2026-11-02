import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from './parts';
import { tips } from './widgets/tips';
import { TipVariantCard, tipVariants } from './widgets/tipVariants';

const meta: Meta = {
  title: 'Hero Cover/Archive/Tips exploration',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const ids = ['feed-tags', 'streaks', 'search', 'extension'];
const sample = tips.filter((tip) => ids.includes(tip.id));

export const TipsExploration: StoryObj = {
  name: 'Tips exploration',
  render: () => (
    <Page
      chapter="Archive"
      question="How should a tip use its color and its icon?"
      title="Tips exploration"
      goal="Ten directions for the tip over the ad slot, on the same copy and at the slot's width. A (Base) was chosen and ships on Final › 5. Widgets › Tips."
      metric="Tip action clicks per impression."
    >
      {tipVariants.map(({ variant, name, idea }) => (
        <Case
          key={variant}
          title={variant === 'base' ? `${name} (chosen)` : name}
          note={idea}
        >
          <div className="flex flex-wrap items-start gap-8">
            {sample.map((tip) => (
              <figure key={tip.id} className="flex w-[17.25rem] flex-col gap-2">
                <figcaption className="text-text-tertiary typo-footnote">
                  {tip.eyebrow}
                </figcaption>
                <TipVariantCard tip={tip} variant={variant} />
              </figure>
            ))}
          </div>
        </Case>
      ))}
    </Page>
  ),
};
