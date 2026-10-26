import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Stage } from '../parts';
import type { OverflowStrategy } from './shelf';
import { Shelf } from './shelf';
import { HeroInFeed } from './frame';
import { COLUMNS, w } from './directions';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget exploration/3. Overflow',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Fifteen units of widgets for a row that holds ten.
const tooMany = () => [
  w('featured', 'l'),
  w('happening', 'm'),
  w('agents', 'm'),
  w('notifications', 's'),
  w('dms', 's'),
  w('bookmarks', 'm'),
  w('digest', 'w'),
  w('podcast', 's'),
];

const strategies: { value: OverflowStrategy; title: string; note: string }[] = [
  {
    value: 'limit',
    title: 'Limit',
    note: 'The row holds what fits; the gallery says the row is full and asks you to remove one first. Predictable, and honest about the budget.',
  },
  {
    value: 'pages',
    title: 'Pages',
    note: 'A second screen behind dots. Unlimited room, but page two is rarely visited.',
  },
  {
    value: 'stack',
    title: 'Stacks',
    note: 'What does not fit stacks into the last tall slot; the dots on its edge step through it. Nothing is lost, nothing grows.',
  },
  {
    value: 'scroll',
    title: 'Scroll rail',
    note: 'The row scrolls sideways. Unlimited, but on desktop sideways scrolling is easy to miss.',
  },
  {
    value: 'smart',
    title: 'Smart slot',
    note: 'Like a stack, but the system picks which widget is on top for the moment, and says why.',
  },
];

export const Overflow: StoryObj = {
  name: '3. Overflow',
  render: () => (
    <Page
      chapter="Widgets · 3"
      question="What happens when it does not fit?"
      title="Five answers to fifteen units in a row of ten"
      goal="See the same too-many widgets under each strategy, on the same five-column feed."
      metric="Share of added widgets that are actually seen in a session, by strategy."
    >
      {strategies.map(({ value, title, note }) => (
        <Case key={value} title={title} note={note}>
          <Stage columns={5}>
            <HeroInFeed columns={COLUMNS}>
              <Shelf widgets={tooMany()} columns={COLUMNS} overflow={value} />
            </HeroInFeed>
          </Stage>
        </Case>
      ))}
    </Page>
  ),
};
