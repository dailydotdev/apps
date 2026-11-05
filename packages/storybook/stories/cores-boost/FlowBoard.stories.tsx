import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Board } from './board';
import { BoardContent, frames } from './journeys';

const meta: Meta = {
  title: 'Cores & Boost/Flow board',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const TodayAndFixed: Story = {
  name: 'Today and fixed',
  render: () => (
    <Board frames={frames}>
      <BoardContent />
    </Board>
  ),
};
