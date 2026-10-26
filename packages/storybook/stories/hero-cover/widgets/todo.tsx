import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { WidgetSize } from './catalog';
import { WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * The reader's own list. Type and press Enter to add, tick to finish, click
 * a to-do to edit it (clear it to delete), drag the handle on the right (or
 * Alt + arrows) to reorder. Finished items settle for a beat, then fold into
 * Done. No backend work: the list lives in this browser through
 * usePersistentContext (IndexedDB), the store post drafts use. Syncing
 * across devices needs an API field later.
 */

export type Todo = { id: string; text: string; done: boolean };

export const sampleTodos: Todo[] = [
  { id: '1', text: 'Review Ido’s PR on the hero rail', done: false },
  { id: '2', text: 'Read the Bun 2.0 release notes', done: false },
  { id: '3', text: 'Try TanStack Charts on the dashboard', done: false },
  { id: '4', text: 'Reply to the Rust Builders thread', done: true },
  { id: '5', text: 'Book the hackathon room', done: false },
  { id: '6', text: 'Write up the Postgres index findings', done: false },
  { id: '7', text: 'Upgrade Node to 26 on CI', done: true },
];

const suggestions = [
  'Read 3 posts today',
  'Review an open PR',
  'Try one new tool this week',
];

const settleMs = 700;
const ease = 'cubic-bezier(0.2, 0, 0, 1)';

const accent = (name: string, percent: number): string =>
  `color-mix(in srgb, var(--theme-accent-${name}-default) ${percent}%, transparent)`;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const PlusGlyph = ({ className }: { className?: string }): ReactElement => (
  <svg viewBox="0 0 12 12" className={className} aria-hidden>
    <path
      d="M6 1.5v9M1.5 6h9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
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
    <VIcon
      size={IconSize.XXSmall}
      secondary
      className={classNames(
        'text-white transition-[opacity,transform] duration-150 motion-reduce:transition-none',
        isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    />
  </button>
);

/** Inline edit: Enter or click away saves, Escape cancels, empty deletes. */
const EditText = ({
  text,
  onCommit,
  onCancel,
}: {
  text: string;
  onCommit: (text: string) => void;
  onCancel: () => void;
}): ReactElement => {
  const [value, setValue] = useState(text);
  return (
    <textarea
      value={value}
      rows={1}
      // Only rendered after the reader clicked the text, so focus is expected.
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      onFocus={(event) => {
        const { length } = event.target.value;
        event.target.setSelectionRange(length, length);
      }}
      onChange={(event) => setValue(event.target.value.replace(/\n/g, ''))}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onCommit(value);
        }
        if (event.key === 'Escape') {
          onCancel();
        }
      }}
      onBlur={() => onCommit(value)}
      style={{ fieldSizing: 'content' } as CSSProperties}
      className="min-w-0 flex-1 resize-none bg-transparent p-0 text-text-primary outline-none typo-footnote"
    />
  );
};

const Row = ({
  todo,
  isEditing,
  isDragging,
  rowRef,
  onToggle,
  onEdit,
  onCommit,
  onCancel,
  onMove,
  onGrab,
}: {
  todo: Todo;
  isEditing: boolean;
  isDragging: boolean;
  rowRef: (el: HTMLLIElement | null) => void;
  onToggle: () => void;
  onEdit: () => void;
  onCommit: (text: string) => void;
  onCancel: () => void;
  onMove: (step: -1 | 1) => void;
  onGrab?: (event: PointerEvent<HTMLSpanElement>) => void;
}): ReactElement => (
  <li
    ref={rowRef}
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
      'group/todo relative -mx-2 flex min-h-8 items-center gap-2.5 rounded-12 py-1.5 pl-2 pr-1 transition-[background-color,box-shadow] duration-150',
      isDragging
        ? 'z-3 bg-surface-float shadow-2'
        : 'hover:bg-surface-hover focus-within:bg-surface-hover',
    )}
  >
    <Check isDone={todo.done} onToggle={onToggle} label={todo.text} />
    {isEditing ? (
      <EditText text={todo.text} onCommit={onCommit} onCancel={onCancel} />
    ) : (
      <button
        type="button"
        onClick={onEdit}
        disabled={todo.done}
        className={classNames(
          'min-w-0 flex-1 cursor-text text-left typo-footnote transition-colors duration-200',
          todo.done ? 'text-text-quaternary line-through' : 'text-text-primary',
        )}
      >
        {todo.text}
      </button>
    )}
    {onGrab && !todo.done && (
      <span
        onPointerDown={onGrab}
        title="Drag to reorder (or Alt + ↑/↓)"
        className={classNames(
          'flex h-6 w-5 shrink-0 touch-none items-center justify-center rounded-6 text-text-tertiary transition-opacity hover:bg-surface-float hover:text-text-primary',
          isDragging
            ? 'cursor-grabbing opacity-100'
            : 'cursor-grab opacity-0 group-focus-within/todo:opacity-100 group-hover/todo:opacity-100',
        )}
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
        'group/add flex shrink-0 cursor-text items-center gap-2.5 rounded-12 bg-surface-float px-2 transition-[background-color,box-shadow] duration-150 focus-within:bg-background-default focus-within:ring-2 focus-within:ring-accent-cabbage-default',
        isCompact ? 'h-9' : 'h-10',
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-max bg-accent-cabbage-default text-white">
        <PlusGlyph className="size-2.5" />
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
          text ? 'opacity-100' : 'opacity-0',
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

type Drag = {
  id: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  originLeft: number;
  originTop: number;
};

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settling, setSettling] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const slots = useRef(new Map<string, { left: number; top: number }>());
  const drag = useRef<Drag | null>(null);

  const open = todos.filter((t) => !t.done || settling.includes(t.id));
  const done = todos.filter((t) => t.done && !settling.includes(t.id));
  const openCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - openCount;

  /* The dragged row follows the pointer from wherever its slot now is. */
  const followPointer = () => {
    const d = drag.current;
    const el = d && rows.current.get(d.id);
    if (!d || !el) {
      return;
    }
    const dx = d.originLeft + d.x - d.startX - el.offsetLeft;
    const dy = d.originTop + d.y - d.startY - el.offsetTop;
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  /* Rows that changed slot glide there instead of jumping (FLIP). */
  useLayoutEffect(() => {
    const isStill = prefersReducedMotion();
    rows.current.forEach((el, id) => {
      const next = { left: el.offsetLeft, top: el.offsetTop };
      const prev = slots.current.get(id);
      slots.current.set(id, next);
      if (!prev || isStill || id === drag.current?.id) {
        return;
      }
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (!dx && !dy) {
        return;
      }
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = `transform 220ms ${ease}`;
        el.style.transform = '';
      });
    });
    followPointer();
  });

  const reorder = (id: string, targetId: string) =>
    setTodos((current) => {
      const from = current.findIndex((t) => t.id === id);
      const to = current.findIndex((t) => t.id === targetId);
      if (from < 0 || to < 0 || from === to) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const step = (id: string, by: -1 | 1) => {
    const ids = open.filter((t) => !t.done).map((t) => t.id);
    const target = ids[ids.indexOf(id) + by];
    if (target) {
      reorder(id, target);
    }
  };

  const grab = (id: string) => (event: PointerEvent<HTMLSpanElement>) => {
    const el = rows.current.get(id);
    if (!el || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      originLeft: el.offsetLeft,
      originTop: el.offsetTop,
    };
    setDraggingId(id);
    const handle = event.currentTarget;

    const onMove = (move: globalThis.PointerEvent) => {
      const d = drag.current;
      const self = rows.current.get(id);
      if (!d || !self) {
        return;
      }
      d.x = move.clientX;
      d.y = move.clientY;
      followPointer();
      // Swap with whichever open row's slot is closer than our own.
      const centerX = d.originLeft + d.x - d.startX + self.offsetWidth / 2;
      const centerY = d.originTop + d.y - d.startY + self.offsetHeight / 2;
      const distance = (el: HTMLLIElement) =>
        Math.hypot(
          el.offsetLeft + el.offsetWidth / 2 - centerX,
          el.offsetTop + el.offsetHeight / 2 - centerY,
        );
      let best: { id: string; distance: number } = {
        id,
        distance: distance(self),
      };
      todos
        .filter((t) => !t.done && t.id !== id)
        .forEach((t) => {
          const el = rows.current.get(t.id);
          const d2 = el ? distance(el) : Infinity;
          if (d2 < best.distance) {
            best = { id: t.id, distance: d2 };
          }
        });
      if (best.id !== id) {
        reorder(id, best.id);
      }
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      const self = rows.current.get(id);
      drag.current = null;
      setDraggingId(null);
      if (self) {
        self.style.transition = `transform 200ms ${ease}`;
        self.style.transform = '';
      }
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  const toggle = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
    if (todo && !todo.done) {
      setSettling((current) => [...current, id]);
      window.setTimeout(
        () => setSettling((current) => current.filter((s) => s !== id)),
        prefersReducedMotion() ? 0 : settleMs,
      );
    }
  };
  const commit = (id: string, text: string) => {
    setEditingId(null);
    setTodos((current) =>
      text.trim()
        ? current.map((t) => (t.id === id ? { ...t, text: text.trim() } : t))
        : current.filter((t) => t.id !== id),
    );
  };
  const add = (text: string) =>
    setTodos((current) => [
      ...current,
      { id: `${Date.now()}`, text, done: false },
    ]);
  const clearDone = () => setTodos((current) => current.filter((t) => !t.done));

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
        size === 's' && openCount ? (
          <span className="font-bold tabular-nums text-accent-cabbage-default typo-caption1">
            {openCount}
          </span>
        ) : undefined
      }
      trailing={
        size === 's' ? (
          <button
            type="button"
            aria-label={isAdding ? 'Close' : 'Add a to-do'}
            aria-expanded={isAdding}
            onClick={() => setIsAdding((v) => !v)}
            className="flex size-6 items-center justify-center rounded-max bg-accent-cabbage-default text-white transition-transform active:scale-90"
          >
            <PlusGlyph
              className={classNames(
                'size-3 transition-transform duration-200 motion-reduce:transition-none',
                isAdding && 'rotate-45',
              )}
            />
          </button>
        ) : doneCount > 0 ? (
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

  const renderRows = (list: Todo[]) =>
    list.map((todo) => (
      <Row
        key={todo.id}
        todo={todo}
        isEditing={editingId === todo.id}
        isDragging={draggingId === todo.id}
        rowRef={(el) => {
          if (el) {
            rows.current.set(todo.id, el);
          } else {
            rows.current.delete(todo.id);
            slots.current.delete(todo.id);
          }
        }}
        onToggle={() => toggle(todo.id)}
        onEdit={() => setEditingId(todo.id)}
        onCommit={(text) => commit(todo.id, text)}
        onCancel={() => setEditingId(null)}
        onMove={(by) => step(todo.id, by)}
        onGrab={todo.done ? undefined : grab(todo.id)}
      />
    ));

  const listClassName =
    size === 'l'
      ? 'grid grid-cols-2 gap-x-6 gap-y-0.5'
      : 'flex flex-col gap-0.5';

  return (
    <div className="relative isolate flex h-full min-h-0 flex-col">
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={material}
      />
      {label}
      {!todos.length && (
        <>
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
                  className="flex items-center gap-1 rounded-max border border-dashed border-border-subtlest-secondary px-2.5 py-1 text-text-secondary typo-caption1 transition-colors hover:border-accent-cabbage-default hover:text-text-primary"
                >
                  <PlusGlyph className="size-2" />
                  {text}
                </button>
              ))}
            </div>
          )}
          {size === 's' && !isAdding && (
            <div className="mt-auto">
              <AddTodo onAdd={add} isCompact />
            </div>
          )}
        </>
      )}
      {todos.length > 0 && size !== 's' && (
        <div className="mt-3">
          <Progress done={doneCount} total={todos.length} />
        </div>
      )}
      {size === 's' && isAdding && (
        <div className="mt-2">
          <AddTodo onAdd={add} isCompact autoFocus />
        </div>
      )}
      {todos.length > 0 && (
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
                {doneCount} finished. Nice work.
              </span>
            </div>
          )}
          <ul className={listClassName}>{renderRows(open)}</ul>
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
                <ul className={listClassName}>{renderRows(done)}</ul>
              )}
            </div>
          )}
        </Scroll>
      )}
      {size !== 's' && (
        <div className="mt-auto pt-3">
          <AddTodo onAdd={add} />
        </div>
      )}
    </div>
  );
};
