import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { promos } from './data';
import type { PromoVariant } from './parts';
import { Case, HeroCover, Page, PromoStrip, Stage } from './parts';

const meta: Meta = {
  title: 'Hero Cover/Archive/First cover/2. Promo strip',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const variants: { variant: PromoVariant; title: string; note: string }[] = [
  {
    variant: 'tile',
    title: 'A · Bar',
    note: 'A dedicated bar per product: icon, eyebrow, title and meta, with the action spelled out as a button underneath. Flat surface, the product colour only in the icon and eyebrow.',
  },
  {
    variant: 'art',
    title: 'B · Art',
    note: 'Text on the left, artwork on the right: the squad cover or podcast art where we have it, the product icon where we do not.',
  },
  {
    variant: 'list',
    title: 'C · List',
    note: 'One card, rows split by hairlines, a thumbnail and an explicit action on each. Reads calmest, and the action names what happens.',
  },
];

// One column of a five-column feed, at the featured card's height.
const COLUMN = { width: '17.25rem', height: '24.5rem' };

export const PromoStripVariants: StoryObj = {
  name: '2. Promo strip',
  render: () => (
    <Page
      chapter="2"
      question="What should a promo bar look like?"
      title="Three treatments for the strip"
      goal="Pick a bar that reads as part of daily.dev, not as an ad, while still pulling the eye from the feed."
      metric="Strip click-through, with ad-blindness checked by comparing it to the ad column's."
    >
      <Case
        title="Side by side"
        note="Three bars and four bars, one column wide."
      >
        <div className="flex flex-wrap gap-10">
          {variants.map(({ variant, title }) =>
            [3, 4].map((count) => (
              <div key={`${variant}-${count}`} className="flex flex-col gap-2">
                <span className="text-text-tertiary typo-footnote">
                  {title} · {count} bars
                </span>
                <div className="flex flex-col" style={COLUMN}>
                  <PromoStrip
                    variant={variant}
                    items={promos.slice(0, count)}
                    className="flex-1"
                  />
                </div>
              </div>
            )),
          )}
        </div>
      </Case>
      {variants.map(({ variant, title, note }) => (
        <Case key={variant} title={`${title} in the cover`} note={note}>
          <Stage columns={5}>
            <HeroCover promoVariant={variant} />
          </Stage>
        </Case>
      ))}
    </Page>
  ),
};
