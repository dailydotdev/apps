import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, HeroCover, Page, Stage } from './parts';

const meta: Meta = {
  title: 'Hero Cover/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const anatomy = [
  ['Featured', '2 columns', 'The editorial carousel we ship today.'],
  ['Ad', '1 column', "The ad slot, as the feed's own ad card."],
  [
    'Agent updates',
    '1 column',
    'A chat thread of agent releases, four lines a message.',
  ],
  [
    'Promo strip',
    '1 column',
    'Three or four Polymarket-style bars that send readers to our own products.',
  ],
];

export const StartHere: StoryObj = {
  name: '0. Start here',
  render: () => (
    <Page
      chapter="0"
      question="What is the hero cover?"
      title="One row for the news, the agents and the product"
      goal="Turn the top of the feed from one story into a front page: the lead story, what the agents shipped, a door into briefing, the podcast and squads, and the ad slot kept."
      metric="Hero click-through per column, visits to briefing, podcast and squads that start from the strip, and ad revenue held flat."
    >
      <Case
        title="The default cover"
        note="Five-column feed. Featured card, the ad as a regular feed card, agent updates as a chat thread, and a strip of three promo bars. Every column ends level with the featured card."
      >
        <Stage columns={5}>
          <HeroCover />
        </Stage>
      </Case>
      <Case
        title="Native"
        note="The current production hero's grammar: no boxes, every column runs down to the carousel's paging row, the ad's controls and View all sit on that row, and only the featured card keeps a fill."
      >
        <Stage columns={5}>
          <HeroCover native />
        </Stage>
      </Case>
      <Case
        title="Flat"
        note="The same cover with no fills on the cards, borders only. Lighter, and closer to the feed below it."
      >
        <Stage columns={5}>
          <HeroCover flat />
        </Stage>
      </Case>
      <Case title="Anatomy">
        <div className="grid max-w-[56rem] grid-cols-[auto_auto_1fr] gap-x-6 gap-y-2 typo-callout">
          {anatomy.map(([name, span, role]) => (
            <React.Fragment key={name}>
              <span className="font-bold text-text-primary">{name}</span>
              <span className="text-text-tertiary">{span}</span>
              <span className="text-text-secondary">{role}</span>
            </React.Fragment>
          ))}
        </div>
      </Case>
      <Case
        title="Open questions"
        note="Who decides what the strip promotes (editorial, rotation, or targeting), whether agent updates come from the agents highlights channel or a new source, and what a six-column feed does with its extra column."
      >
        <span />
      </Case>
    </Page>
  ),
};
