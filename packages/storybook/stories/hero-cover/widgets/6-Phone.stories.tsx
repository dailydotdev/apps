import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Shelf } from './shelf';
import { w } from './directions';

const meta: Meta = {
  title: 'Hero Cover/Widgets/6. Phone',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        mobile375: {
          name: 'Mobile · 375',
          styles: { width: '375px', height: '812px' },
        },
      },
    },
  },
  globals: { viewport: { value: 'mobile375', isRotated: false } },
};

export default meta;

export const Phone: StoryObj = {
  name: '6. Phone',
  render: () => (
    <Page
      chapter="Widgets · 6"
      question="What happens on a phone?"
      title="Two columns, pages you swipe"
      goal="Keep the same widgets and sizes on a phone: the row becomes a two-column home screen, one page at a time."
      metric="Nothing to measure yet: the phone mapping for whichever direction we pick."
    >
      <Case
        title="Page one"
        note="Two columns of the same grid: the top story goes wide, small widgets pair up under it, and the next page holds Happening Now beside the pinned ad."
      >
        <Shelf
          columns={2}
          overflow="pages"
          cellHeight="10rem"
          widgets={[
            w('featured', 'w'),
            w('streak', 's'),
            w('dms', 's'),
            w('happening', 'm'),
            w('ad', 'm', { isLocked: true }),
          ]}
        />
      </Case>
    </Page>
  ),
};
