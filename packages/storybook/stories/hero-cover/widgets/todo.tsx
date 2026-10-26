import type { DragEvent, KeyboardEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * The reader's own list. Type and press Enter to add, tick to finish, drag
 * the handle (or Alt+arrows) to reorder; finished items fold into Done.
 * No backend work: the list lives in this browser through
 * usePersistentContext (IndexedDB), the store post drafts use. Syncing
 * across devices needs an API field later.
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
  { id: '7', text: 'Upgrade Node to 26 on CI', done: true },
];

const suggestions = [
  'Read 3 posts today',
  'Review an open PR',
  'Try one new tool this week',
];

const accent = (name: string, percent: number): string =>
  `color-mix(in srgb, var(--theme-accent-${name}-default) ${percent}%, transparent)`;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

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
      'flex size-5 shrink-0 items-center justify-center rounded-max border-2 transition-[background-color,border-color,transform] duration-150 active:scale-90 motion-reduce:transition-none',
      isDone
        ? 'border-accent-cabbage-default bg-accent-cabbage-default'
        : 'border-border-subtlest-secondary hover:border-accent-cabbage-default',
    )}
  >
    {isDone && (
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
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

const Grip = (): ReactElement => (
  <svg viewBox="0 0 8 14" width={8} height={14} aria-hidden>
    {[2, 7, 12].map((y) =>
      [2, 6].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="currentColor" />
      )),
    )}
  </svg>
);

const Row = ({
  todo,
  isDragOver,
  onToggle,
  onRemove,
  onMove,
  dragProps,
}: {
  todo: Todo;
  isDragOver: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMove: (step: -1 | 1) => void;
  dragProps: React.LiHTMLAttributes<HTMLLIElement>;
}): ReactElement => (
  <li
    {...dragProps}
    onKeyDown={(event) => {
      if (
        event.altKey &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      ) {
        event.preventDefault();
        onMove(event.key === 'ArrowUp' ? -1 : 1);
      }
    }}
    className={classNames(
      'group/todo relative -mx-2 flex items-center gap-2 rounded-12 py-1.5 pl-2 pr-1 transition-colors hover:bg-surface-hover',
      isDragOver &&
        'before:absolute before:inset-x-2 before:-top-px before:h-0.5 before:rounded-max before:bg-accent-cabbage-default',
    )}
  >
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
      <span className="shrink-0 rounded-6 bg-accent-cabbage-flat px-1.5 font-bold text-accent-cabbage-default typo-caption2 group-hover/todo:hidden">
        {todo.tag}
      </span>
    )}
    <button
      type="button"
      aria-label={`Delete ${todo.text}`}
      onClick={onRemove}
      className="hidden size-5 shrink-0 items-center justify-center rounded-6 text-text-tertiary hover:bg-surface-float hover:text-text-primary group-focus-within/todo:flex group-hover/todo:flex"
    >
      ×
    </button>
    {!todo.done && (
      <span
        className="hidden h-5 w-4 shrink-0 cursor-grab items-center justify-center text-text-tertiary hover:text-text-primary active:cursor-grabbing group-focus-within/todo:flex group-hover/todo:flex"
        title="Drag to reorder (or Alt + ↑/↓)"
      >
        <Grip />
      </span>
    )}
  </li>
);

/** The add row: always there, anchored, one obvious place to type. */
const AddTodo = ({
  onAdd,
  isCompact,
  autoFocus,
}: {
  onAdd: (text: string) => void;
  isCompact?: boolean;
  autoFocus?: boolean;
}): ReactElement => {
  const [text, setText] = useState('');
  const submit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };
  return (
    <label
      className={classNames(
        'group/add flex shrink-0 cursor-text items-center gap-2.5 rounded-12 bg-surface-float px-2.5 transition-colors focus-within:bg-background-default focus-within:ring-2 focus-within:ring-accent-cabbage-default',
        isCompact ? 'h-9' : 'h-10',
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-max bg-accent-cabbage-default font-bold leading-none text-white">
        +
      </span>
      <input
        value={text}
        // The widget only renders this when asked for, so focus is expected.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={submit}
        placeholder="Add a to-do"
        className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-footnote placeholder:text-text-tertiary"
      />
      <kbd
        className={classNames(
          'rounded-6 border border-border-subtlest-secondary px-1.5 text-text-quaternary typo-caption2 transition-opacity',
          text ? 'opacity-100' : 'opacity-0 group-focus-within/add:opacity-100',
        )}
      >
        ↵
      </kbd>
    </label>
  );
};

const Progress = ({
  done,
  total,
}: {
  done: number;
  total: number;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 flex-1 overflow-hidden rounded-max bg-surface-float">
      <div
        className="h-full rounded-max bg-accent-cabbage-default transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${total ? (done / total) * 100 : 0}%` }}
      />
    </div>
    <span className="shrink-0 tabular-nums text-text-tertiary typo-caption1">
      {done} of {total} done
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* The widget                                                          */
/* ------------------------------------------------------------------ */

export const TodoWidget = ({
  size,
  initial = sampleTodos,
  isAddingInitially = false,
}: {
  size: WidgetSize;
  initial?: Todo[];
  isAddingInitially?: boolean;
}): ReactElement => {
  const [todos, setTodos] = useState(initial);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(isAddingInitially);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const toggle = (id: string) =>
    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  const remove = (id: string) =>
    setTodos((current) => current.filter((t) => t.id !== id));
  const add = (text: string) =>
    setTodos((current) => [
      ...current,
      { id: `${Date.now()}`, text, done: false },
    ]);
  const clearDone = () => setTodos((current) => current.filter((t) => !t.done));

  const moveTo = (id: string, beforeId: string | null) =>
    setTodos((current) => {
      const item = current.find((t) => t.id === id);
      if (!item || id === beforeId) {
        return current;
      }
      const rest = current.filter((t) => t.id !== id);
      const at = beforeId
        ? rest.findIndex((t) => t.id === beforeId)
        : rest.length;
      rest.splice(at < 0 ? rest.length : at, 0, item);
      return rest;
    });
  const step = (id: string, by: -1 | 1) => {
    const ids = open.map((t) => t.id);
    const i = ids.indexOf(id);
    const target = i + by;
    if (target < 0 || target >= ids.length) {
      return;
    }
    moveTo(id, by === -1 ? ids[target] : ids[target + 1] ?? null);
  };

  const dragPropsFor = (todo: Todo): React.LiHTMLAttributes<HTMLLIElement> =>
    todo.done
      ? { tabIndex: 0 }
      : {
          draggable: true,
          tabIndex: 0,
          onDragStart: (event: DragEvent<HTMLLIElement>) => {
            dragging.current = todo.id;
            event.dataTransfer.effectAllowed = 'move';
          },
          onDragOver: (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();
            setDragOver(todo.id);
          },
          onDrop: (event: DragEvent<HTMLLIElement>) => {
            event.preventDefault();
            if (dragging.current) {
              moveTo(dragging.current, todo.id);
            }
            dragging.current = null;
            setDragOver(null);
          },
          onDragEnd: () => {
            dragging.current = null;
            setDragOver(null);
          },
        };

  const material = {
    backgroundImage: `radial-gradient(90% 60% at 100% 0%, ${accent(
      'cabbage',
      18,
    )} 0%, transparent 70%)`,
  };

  const label = (
    <WidgetLabel
      kind="todo"
      afterName={
        open.length ? (
          <span className="font-bold tabular-nums text-accent-cabbage-default typo-caption1">
            {open.length}
          </span>
        ) : undefined
      }
      trailing={
        size === 's' ? (
          <button
            type="button"
            aria-label={isAdding ? 'Close' : 'Add a to-do'}
            onClick={() => setIsAdding((v) => !v)}
            className="flex size-6 items-center justify-center rounded-max bg-accent-cabbage-default font-bold leading-none text-white transition-transform active:scale-90"
          >
            {isAdding ? '×' : '+'}
          </button>
        ) : done.length > 0 ? (
          <button
            type="button"
            onClick={clearDone}
            className="text-text-tertiary typo-caption1 hover:text-text-primary"
          >
            Clear done
          </button>
        ) : undefined
      }
    />
  );

  /* Empty: something to tap, not a blank box. */
  if (!todos.length) {
    return (
      <div className="relative isolate flex h-full min-h-0 flex-col">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-1"
          style={material}
        />
        {label}
        <span className="mt-3 font-bold text-text-primary typo-callout">
          What will you get done today?
        </span>
        {size !== 's' && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => add(text)}
                className="rounded-max border border-dashed border-border-subtlest-secondary px-2.5 py-1 text-text-secondary typo-caption1 transition-colors hover:border-accent-cabbage-default hover:text-text-primary"
              >
                + {text}
              </button>
            ))}
          </div>
        )}
        <div className="mt-auto">
          <AddTodo onAdd={add} isCompact={size === 's'} />
        </div>
      </div>
    );
  }

  const rows = (list: Todo[]) =>
    list.map((todo) => (
      <Row
        key={todo.id}
        todo={todo}
        isDragOver={dragOver === todo.id && dragging.current !== todo.id}
        onToggle={() => toggle(todo.id)}
        onRemove={() => remove(todo.id)}
        onMove={(by) => step(todo.id, by)}
        dragProps={dragPropsFor(todo)}
      />
    ));

  return (
    <div className="relative isolate flex h-full min-h-0 flex-col">
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={material}
      />
      {label}
      {size !== 's' && (
        <div className="mt-3">
          <Progress done={done.length} total={todos.length} />
        </div>
      )}
      {size === 's' && isAdding && (
        <div className="mt-2">
          <AddTodo onAdd={add} isCompact autoFocus />
        </div>
      )}
      <Scroll isUnderHeader={false} className="mt-1">
        {!open.length && (
          <div className="flex flex-col items-center gap-1 py-6 text-center">
            <span className="flex size-10 items-center justify-center rounded-max bg-accent-cabbage-flat text-accent-cabbage-default typo-title3">
              ✓
            </span>
            <span className="font-bold text-text-primary typo-callout">
              All done
            </span>
            <span className="text-text-tertiary typo-footnote">
              {done.length} finished. Nice work.
            </span>
          </div>
        )}
        <ul
          className={classNames(
            'gap-0.5',
            size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
          )}
        >
          {rows(open)}
        </ul>
        {size !== 's' && done.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              aria-expanded={isDoneOpen}
              onClick={() => setIsDoneOpen((v) => !v)}
              className="flex items-center gap-1.5 py-1 text-text-tertiary typo-caption1 hover:text-text-primary"
            >
              <span
                className={classNames(
                  'transition-transform',
                  isDoneOpen && 'rotate-90',
                )}
              >
                ›
              </span>
              Done · {done.length}
            </button>
            {isDoneOpen && (
              <ul
                className={classNames(
                  'gap-0.5',
                  size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
                )}
              >
                {rows(done)}
              </ul>
            )}
          </div>
        )}
      </Scroll>
      {size !== 's' && (
        <div className="pt-3">
          <AddTodo onAdd={add} />
        </div>
      )}
    </div>
  );
};
