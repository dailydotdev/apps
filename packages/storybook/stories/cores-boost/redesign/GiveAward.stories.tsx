import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { awards } from '../real/catalog';
import { Stage } from '../flows/purchase/stage';
import { AwardNoteRedesign } from './purchase/AwardRedesign';

// "2. Give an award", redrawn in the squads hub line.
// Picking the award, processing and the sent screen stay as production has
// them; Buy Cores and the note are redesigned.

const balance = 20;
const coffee = awards.find(({ name }) => name === 'Coffee Mug') as Product;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/3. Awards/Give an award',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: coresHandlers({ balance }) },
  },
};

export default meta;

type Story = StoryObj;

const story = (
  description: string,
  render: () => ReactElement,
  startBalance = balance,
): Story => ({
  parameters: {
    msw: { handlers: coresHandlers({ balance: startBalance }) },
    docs: { description: { story: description } },
  },
  render: () => (
    <CoresProviders balance={startBalance} activePage="/posts/sb-post">
      {render()}
    </CoresProviders>
  ),
});

export const NoteAndSend = story(
  'A check chip confirms the Cores, the award sits in a bordered card with its glow image and price, and the note follows.',
  () => (
    <Stage>
      <AwardNoteRedesign
        product={coffee}
        coresAdded={100}
        onBack={noop}
        onSent={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
  balance + 100,
);

// The story index reads names statically, not through the helper
NoteAndSend.storyName = '6 · Note and send';
