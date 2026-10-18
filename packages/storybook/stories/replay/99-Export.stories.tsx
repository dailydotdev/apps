import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  annualFlagships,
  catalog,
  handoffFrame,
  openerFrame,
} from './catalog';
import { DESIGN_WIDTH, FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';

/**
 * Every card at authoring size, one per row, each tagged with its id.
 *
 * This story exists to be photographed, not read: a Playwright script
 * screenshots each `[data-card-id]` element so the whole catalog can be
 * published as one self-contained page with pixel-accurate cards. The cut
 * cards are included on purpose — a review needs to see what was cut and why.
 */
const meta: Meta = {
  title: 'Replay/99. Export',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const ALL = [...catalog, ...annualFlagships, handoffFrame, openerFrame];

export const Export4x5: Story = {
  name: 'Export 4:5',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 24,
        padding: 24,
        background: '#FFFFFF',
      }}
    >
      <FrameStyles />
      {ALL.map((candidate) => (
        <div key={candidate.id} data-card-id={candidate.id}>
          <FrameThumb
            width={DESIGN_WIDTH}
            aspect="4:5"
            candidate={candidate}
            data={sampleData[candidate.id]}
          />
        </div>
      ))}
    </div>
  ),
};

export const Export: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 24,
        padding: 24,
        background: '#FFFFFF',
      }}
    >
      <FrameStyles />
      {ALL.map((candidate) => (
        <div key={candidate.id} data-card-id={candidate.id}>
          <FrameThumb
            width={DESIGN_WIDTH}
            candidate={candidate}
            data={sampleData[candidate.id]}
          />
        </div>
      ))}
    </div>
  ),
};
