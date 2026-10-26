import type { KeyboardEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * A to-do list in the Reminders grammar: a count, round checks, and a line
 * to type the next one. No backend work: the list lives in the reader's
 * browser through usePersistentContext (IndexedDB), the same store post
 * drafts use, so it survives reloads on this device. Syncing across devices
 * would need an API field later.
 */

export type Todo = { id: string; text: string; done: boolean; tag?: string };

export const sampleTodos: Todo[] = [
  {
    id: '1',
    text: 'Review Ido’s PR on the hero rail',
    done: false,
    tag: 'Today',
  },
  {
    id: '2',
    text: 'Read the Bun 2.0 release notes',
    done: false,
    tag: 'Today',
  },
  { id: '3', text: 'Try TanStack Charts on the dashboard', done: false },
  { id: '4', text: 'Reply to the Rust Builders thread', done: true },
  { id: '5', text: 'Book the hackathon room', done: false, tag: 'Fri' },
  { id: '6', text: 'Write up the Postgres index findings', done: false },
  { id: '7', text: 'Upgrade Node to 26 on CI', done: false },
];

const Check = ({
  isDone,
  onToggle,
  label,
}: {
  isDone: boolean;
  onToggle: () => void;
  label: string;
}): ReactElement => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isDone}
    aria-label={label}
    onClick={onToggle}
    className={classNames(
      'mt-0.5 flex size-[1.125rem] shrink-0 items-center justify-center rounded-max border-2 transition-colors',
      isDone
        ? 'border-accent-cabbage-default bg-accent-cabbage-default'
        : 'border-border-subtlest-secondary hover:border-accent-cabbage-default',
    )}
  >
    {isDone && (
      <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
        <path
          d="M2.5 6.2 5 8.6 9.5 3.6"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const Row = ({
  todo,
  onToggle,
}: {
  todo: Todo;
  onToggle: () => void;
}): ReactElement => (
  <li className="-mx-2 flex items-start gap-2.5 rounded-12 px-2 py-1.5 transition-colors hover:bg-surface-hover">
    <Check isDone={todo.done} onToggle={onToggle} label={todo.text} />
    <span
      className={classNames(
        'min-w-0 flex-1 typo-footnote',
        todo.done ? 'text-text-quaternary line-through' : 'text-text-primary',
      )}
    >
      {todo.text}
    </span>
    {todo.tag && !todo.done && (
      <span className="shrink-0 rounded-6 bg-accent-cabbage-flat px-1.5 font-bold text-accent-cabbage-default typo-caption2">
        {todo.tag}
      </span>
    )}
  </li>
);

const NewTodo = ({
  onAdd,
}: {
  onAdd: (text: string) => void;
}): ReactElement => {
  const [text, setText] = useState('');
  const submit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };
  return (
    <label className="flex items-center gap-2.5 rounded-12 border border-dashed border-border-subtlest-secondary px-2.5 py-1.5 focus-within:border-accent-cabbage-default">
      <span className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-max border-2 border-dashed border-border-subtlest-secondary text-text-quaternary">
        +
      </span>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={submit}
        placeholder="New to-do"
        className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-footnote placeholder:text-text-quaternary"
      />
    </label>
  );
};

export const TodoWidget = ({
  size,
  initial = sampleTodos,
}: {
  size: WidgetSize;
  initial?: Todo[];
}): ReactElement => {
  const [todos, setTodos] = useState(initial);
  const open = todos.filter((t) => !t.done);
  const toggle = (id: string) =>
    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  const add = (text: string) =>
    setTodos((current) => [
      { id: `${Date.now()}`, text, done: false },
      ...current,
    ]);
  const ordered = [...open, ...todos.filter((t) => t.done)];

  const count = (
    <span className="font-bold tabular-nums text-accent-cabbage-default typo-title1">
      {open.length}
    </span>
  );

  if (!todos.length) {
    return (
      <Stack>
        <WidgetLabel kind="todo" />
        <span className="mt-3 font-bold text-text-primary typo-callout">
          What do you want to get done?
        </span>
        <span className="mt-1 text-text-tertiary typo-footnote">
          Saved on this device. Press Enter to add.
        </span>
        <div className="mt-auto">
          <NewTodo onAdd={add} />
        </div>
      </Stack>
    );
  }

  if (!open.length) {
    return (
      <Stack>
        <WidgetLabel kind="todo" trailing={count} />
        <div className="m-auto flex flex-col items-center gap-1 text-center">
          <span className="font-bold text-text-primary typo-callout">
            All done.
          </span>
          <span className="text-text-tertiary typo-footnote">
            {todos.length} finished. Nice work.
          </span>
        </div>
        {size !== 's' && <NewTodo onAdd={add} />}
      </Stack>
    );
  }

  return (
    <Stack>
      <WidgetLabel kind="todo" trailing={count} />
      {size !== 's' && (
        <div className="mt-3">
          <NewTodo onAdd={add} />
        </div>
      )}
      <Scroll
        isUnderHeader={size === 's'}
        className={size !== 's' ? 'mt-1' : undefined}
      >
        <ul
          className={classNames(
            'gap-0.5',
            size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
          )}
        >
          {(size === 's' ? open : ordered).map((todo) => (
            <Row key={todo.id} todo={todo} onToggle={() => toggle(todo.id)} />
          ))}
        </ul>
      </Scroll>
    </Stack>
  );
};
