import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import { sampleTodos, TodoWidget } from './todo';

const meta: Meta = {
  title: 'Hero Cover/Widgets/11. To-do',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Todo: StoryObj = {
  name: '11. To-do',
  render: () => (
    <Page
      chapter="Widgets · 11"
      question="Can the hero hold the reader's own list?"
      title="To-do"
      goal="A quick list in the Reminders grammar: type, Enter, check off. The first widget the reader writes into, which makes the rail feel like theirs."
      metric="Share of readers who add a to-do, and return visits per week for readers with open to-dos."
    >
      <Case
        title="How it works"
        note="No backend for launch: the list is saved in the reader's browser with usePersistentContext (IndexedDB), the same store post drafts use, so it survives reloads on this device. Syncing across devices and the extension needs an API field later. Every widget here is live: add a to-do and check one off."
      >
        <Decisions
          items={[
            'Device-only for launch, or wait for sync',
            'Due chips (Today, Fri) or plain items',
            'Link a to-do to a post: “Read later” from any card',
            'One list, or lists the reader names',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          <StateRow
            title="A working list"
            note="Small shows what is open; Tall and Large add the input and the finished ones, struck through."
            render={(size) => <TodoWidget size={size} />}
          />
          <StateRow
            title="Empty: first to-do"
            render={(size) => <TodoWidget size={size} initial={[]} />}
          />
          <StateRow
            title="All done"
            render={(size) => (
              <TodoWidget
                size={size}
                initial={sampleTodos.map((todo) => ({ ...todo, done: true }))}
              />
            )}
          />
          <StateRow
            title="One thing left"
            render={(size) => (
              <TodoWidget
                size={size}
                initial={sampleTodos.map((todo, i) => ({
                  ...todo,
                  done: i > 0,
                }))}
              />
            )}
          />
        </div>
      </Case>
    </Page>
  ),
};
