import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { AdSlot, campaignStrips } from '../adSlot';
import { StateRow } from '../review';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Sponsored',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const ours = campaignStrips.filter((strip) => !strip.isPaid);

export const Sponsored: StoryObj = {
  name: 'Sponsored',
  render: () => (
    <WidgetPage
      title="Sponsored"
      kinds={[
        {
          kind: 'ad',
          label: 'The ad alone',
          note: 'Locked second on the rail, always Tall, never removable.',
        },
      ]}
      metric="Ad revenue per visit held flat against today's hero, and strip clicks per impression."
    >
      <StateRow
        title="With campaign strips"
        note="Up to two of our strips (or one paid) above the ad; the creative shrinks to make room."
        variants={[
          {
            caption: 'One strip',
            size: 'm',
            isBare: true,
            node: <AdSlot strips={ours.slice(0, 1)} className="h-full" />,
          },
          {
            caption: 'Two strips',
            size: 'm',
            isBare: true,
            node: <AdSlot strips={ours.slice(0, 2)} className="h-full" />,
          },
          {
            caption: 'A paid strip',
            size: 'm',
            isBare: true,
            node: (
              <AdSlot
                strips={campaignStrips.filter((strip) => strip.isPaid)}
                className="h-full"
              />
            ),
          },
        ]}
      />
      <StateRow
        title="Plus, and edit mode"
        note="Plus readers get the strips without the ad. In edit mode the slot shows it is locked: no handle, no menu."
        variants={[
          {
            caption: 'Plus',
            size: 'm',
            isBare: true,
            node: (
              <AdSlot strips={ours.slice(0, 2)} isPlus className="h-full" />
            ),
          },
          {
            caption: 'Edit mode',
            size: 'm',
            isBare: true,
            node: (
              <AdSlot strips={ours.slice(0, 1)} isEditing className="h-full" />
            ),
          },
        ]}
      />
    </WidgetPage>
  ),
};
