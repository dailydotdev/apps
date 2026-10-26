import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import { IntroQuestsWidget } from './introQuests';

const meta: Meta = {
  title: 'Hero Cover/Widgets/10. Getting started',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const GettingStarted: StoryObj = {
  name: '10. Getting started',
  render: () => (
    <Page
      chapter="Widgets · 10"
      question="How do new readers find the intro quests?"
      title="Getting started"
      goal="Put the intro quests in the rail for new readers, with their rewards, so the first actions that make daily.dev stick are one click away instead of behind a modal."
      metric="Intro quests completed in the first 7 days, and day-7 retention for readers who see the widget versus the modal."
    >
      <Case
        title="How it works"
        note="These are production's QuestType.Intro quests and CompactQuestRow, so progress and claiming work as they do today (useQuestDashboard, useClaimQuestReward). New readers get the widget first in the rail; it can't be removed until it retires, and it retires itself once every quest is claimed. Try Claim on the third quest."
      >
        <Decisions
          items={[
            'Placed by default for new readers, or offered in the gallery',
            'Position: first in the rail, or right after the top story',
            'Removable before it’s done, or only after',
            'Keep the intro modal as well, or replace it',
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
            note="Small shows the ring and the next quest; Tall and Large show the whole list."
            render={(size) => (
              <IntroQuestsWidget size={size} stage="progress" />
            )}
          />
          <StateRow
            title="A reward to claim"
            note="Claiming fills the ring in place."
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
