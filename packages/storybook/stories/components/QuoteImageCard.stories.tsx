import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QuoteImageCard } from '@dailydotdev/shared/src/components/post/QuoteImageCard';

const authorImage =
  'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0';
const sourceImage =
  'https://media.daily.dev/image/upload/s--mqP40YbK--/f_auto/v1707831184/squads/303a826b-28e4-4d2f-938a-c610148e6f01';

const meta: Meta<typeof QuoteImageCard> = {
  title: 'Components/Share/QuoteImageCard',
  component: QuoteImageCard,
  parameters: {
    docs: {
      description: {
        component: [
          'The 1200x630 card rendered at `/image-generator/quote/[id]` and screenshotted into a shareable quote image.',
          'Fixed pixel sizing on purpose — the output is a bitmap.',
          '',
          'The attribution row carries the author avatar badged with the source logo.',
          'Plain `<img>` tags: the screenshot service renders the page once and captures it,',
          'so there is nothing for lazy loading to defer to.',
          '',
          '**Parked:** the share bar no longer offers a "generate quote image" action;',
          'the route and this card stay in place until the screenshot service serves the PNG.',
        ].join('\n'),
      },
    },
  },
  args: {
    quote:
      'Shipping fast is not about typing faster. It is about shrinking the distance between a decision and the moment a real developer feels its effect.',
    title: 'How to ship fast without breaking everything',
    sourceName: 'daily.dev',
    authorName: 'Ido Shamun',
    authorImage,
    sourceImage,
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

/** Author avatar with the source badged on its corner. */
export const Default: Story = {};

// Long selections are truncated by the share bar, but the card still clamps.
export const LongQuote: Story = {
  args: {
    quote:
      'Shipping fast is not about typing faster. It is about shrinking the distance between a decision and the moment a real developer feels its effect, which means every layer between the two is either helping or in the way, and most of them are in the way…',
  },
};

/** No author (most syndicated articles): the source logo stands alone. */
export const SourceOnly: Story = {
  args: { authorName: null, authorImage: null },
};

/** Author with no avatar on file falls back to the anonymous placeholder. */
export const AuthorWithoutAvatar: Story = {
  args: { authorImage: null },
};

/** Neither image resolved — the row collapses to text, no empty boxes. */
export const NoImages: Story = {
  args: { authorImage: null, sourceImage: null, authorName: null },
};
