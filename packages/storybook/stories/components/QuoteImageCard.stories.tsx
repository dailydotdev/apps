import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QuoteImageCard } from '@dailydotdev/shared/src/components/post/QuoteImageCard';

const meta: Meta<typeof QuoteImageCard> = {
  title: 'Components/Share/QuoteImageCard',
  component: QuoteImageCard,
  parameters: {
    docs: {
      description: {
        component:
          'The 1200x630 card rendered at `/image-generator/quote/[id]` and screenshotted into a shareable quote image. Fixed pixel sizing on purpose — the output is a bitmap.',
      },
    },
  },
  args: {
    quote:
      'Shipping fast is not about typing faster. It is about shrinking the distance between a decision and the moment a real developer feels its effect.',
    title: 'How to ship fast without breaking everything',
    sourceName: 'daily.dev',
    authorName: 'Ido Shamun',
  },
  // The card is wider than the docs frame, so scale it down to fit.
  decorators: [
    (Story) => (
      <div className="origin-top-left scale-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof QuoteImageCard>;

export const Default: Story = {};

// Long selections are truncated by the share bar, but the card still clamps.
export const LongQuote: Story = {
  args: {
    quote:
      'Shipping fast is not about typing faster. It is about shrinking the distance between a decision and the moment a real developer feels its effect, which means every layer between the two is either helping or in the way, and most of them are in the way…',
  },
};

// Posts without an author fall back to the source alone.
export const SourceOnly: Story = {
  args: { authorName: null },
};
