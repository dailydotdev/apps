import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import { IntroQuestsWidget } from './introQuests';

const meta: Meta = {
  title: 'Hero Cover/Final/6. Getting started',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const GettingStarted: StoryObj = {
  name: '6. Getting started',
  render: () => (
    <Page
      chapter="Final · 6"
      question="How do new readers find the intro quests?"
      title="Getting started"
      goal="Put the intro quests in the rail for new readers, with their rewards, so the first actions that make daily.dev stick are one click away instead of behind a modal."
      metric="Intro quests completed in the first 7 days, and day-7 retention for readers who see the widget versus the modal."
    >
      <Case
        title="How it works"
        note="The widget speaks the language of the intro quests popup we are launching (Intro Quests, finalist 2, Checklist): one avocado accent, the reward line over a count title, a segmented meter, dashed circles that fill green, and only the step you are on open with its one button. Same quests, rewards and copy, so the widget and the popup read as one feature. Every button works here: start a step, wait for the check, then claim."
      >
        <Decisions
          items={[
            'Placed by default for new readers, or offered in the gallery',
            'Position: first in the rail, or right after the top story',
            'Removable before it’s done, or only after',
            'Keep the intro popup as well, or let the widget replace it',
            'Large: the step you are on as a stage, or the full list open in place',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          <StateRow
            title="Fresh: nothing done yet"
            render={(size) => <IntroQuestsWidget size={size} stage="fresh" />}
          />
          <StateRow
            title="In progress"
            note="Small folds progress into a small meter in the header so the next step, as a compact card with its one button, leads. Tall opens the step you are on inside the list; Large gives it a stage on the left and keeps the list on the right."
            render={(size) => (
              <IntroQuestsWidget size={size} stage="progress" />
            )}
          />
          <StateRow
            title="A reward to claim"
            note="A finished step turns green and its row gets a Claim button. Claiming fills its segment in the meter."
            render={(size) => (
              <IntroQuestsWidget size={size} stage="claimable" />
            )}
          />
          <StateRow
            title="All done"
            note="A last thank-you, then the widget leaves and frees its slot."
            render={(size) => <IntroQuestsWidget size={size} stage="done" />}
          />
        </div>
      </Case>
    </Page>
  ),
};
