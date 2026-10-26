import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import { sampleTodos, TodoWidget } from './todo';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/To-do',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Todo: StoryObj = {
  name: 'To-do',
  render: () => (
    <Page
      chapter="Widgets"
      question="Can the hero hold the reader's own list?"
      title="To-do"
      goal="A quick list the reader owns: the + in the header to add, a tick to finish, a handle to reorder. The first widget the reader writes into, which makes the rail feel like theirs."
      metric="Share of readers who add a to-do, and return visits per week for readers with open to-dos."
    >
      <Case
        title="How it works"
        note="No backend for launch: the list is saved in the reader's browser with usePersistentContext (IndexedDB), the same store post drafts use, so it survives reloads on this device. Syncing across devices and the extension needs an API field later. Every widget here is live: add a to-do and check one off."
      >
        <Decisions
          items={[
            'Reorder by dragging the handle on the right (Alt + ↑/↓ from the keyboard), no separate edit mode',
            'No delete button: click a to-do to edit it, clear the text to remove it',
            'Finished items fold into Done, so the open list stays short',
            'Device-only for launch, or wait for sync',
            'Link a to-do to a post: “Read later” from any card',
            'One list, or lists the reader names',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          <StateRow
            title="A working list"
            note="Hover a row for its drag handle. Click the text to edit, clear it to delete. A ticked to-do stays struck through for a beat, then folds into Done. On every size the + in the header opens the input under it and turns into a close; it stays open for the next one until you close it or press Escape."
            render={(size) => <TodoWidget size={size} />}
          />
          <StateRow
            title="Adding"
            note="The + turns into a close, and the input takes focus under the header."
            render={(size) => <TodoWidget size={size} isAddingInitially />}
          />
          <StateRow
            title="Empty: first to-do"
            note="The input is already open, with suggestions to tap on Tall and Large, so the first one costs nothing."
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
