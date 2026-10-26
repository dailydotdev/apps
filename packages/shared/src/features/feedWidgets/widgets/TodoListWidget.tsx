import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from 'react';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { IconSize } from '../../../components/Icon';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { ChecklistAIcon } from '../../../components/icons/ChecklistA';
import { DragIcon } from '../../../components/icons/Drag';
import { PlusIcon } from '../../../components/icons/Plus';
import { VIcon } from '../../../components/icons/V';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetLoading } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

export type TodoItem = { id: string; text: string; done: boolean };

export const TODO_LIST_MAX_ITEMS = 30;
export const TODO_TEXT_MAX_LENGTH = 140;

/** How long a ticked to-do stays in place, struck through, before Done. */
export const TODO_SETTLE_MS = 700;

export const getTodoListStorageKey = (widgetId: string): string =>
  `feed_widget_todo_list:${widgetId}`;

const emptyTodos: TodoItem[] = [];

const suggestions = [
  'Read 3 posts today',
  'Review an open PR',
  'Try one new tool this week',
];

const ease = 'cubic-bezier(0.2, 0, 0, 1)';

// The widget's own material, a soft cabbage glow from the top corner.
const glowStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%)',
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const createTodoId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const cleanText = (text: string): string =>
  text.trim().slice(0, TODO_TEXT_MAX_LENGTH);

/** The stored list as this build reads it, whatever an older one left. */
const parseTodos = (stored: unknown): TodoItem[] =>
  (Array.isArray(stored) ? stored : [])
    .filter(
      (item): item is TodoItem =>
        !!item &&
        typeof item.id === 'string' &&
        typeof item.text === 'string' &&
        !!item.text.trim(),
    )
    .slice(0, TODO_LIST_MAX_ITEMS)
    .map(({ id, text, done }) => ({ id, text: cleanText(text), done: !!done }));

const Check = ({
  isDone,
  label,
  onToggle,
  onKeyDown,
}: {
  isDone: boolean;
  label: string;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}): ReactElement => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isDone}
    aria-label={label}
    onClick={onToggle}
    onKeyDown={onKeyDown}
    className={classNames(
      'flex size-5 shrink-0 items-center justify-center rounded-max border-2 transition-[background-color,border-color,transform] duration-150 active:scale-90 motion-reduce:transition-none',
      isDone
        ? 'border-accent-cabbage-default bg-accent-cabbage-default'
        : 'border-border-subtlest-secondary hover:border-accent-cabbage-default',
    )}
  >
    <VIcon
      aria-hidden
      secondary
      size={IconSize.XXSmall}
      className={classNames(
        'text-white transition-[opacity,transform] duration-150 motion-reduce:transition-none',
        isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    />
  </button>
);

/** Inline edit: Enter or a click away saves, Escape cancels, empty deletes. */
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
  const isClosed = useRef(false);
  const close = (action: () => void) => {
    if (isClosed.current) {
      return;
    }
    isClosed.current = true;
    action();
  };

  return (
    <textarea
      value={value}
      rows={1}
      maxLength={TODO_TEXT_MAX_LENGTH}
      aria-label="Edit to-do"
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
          close(() => onCommit(value));
        }
        if (event.key === 'Escape') {
          close(onCancel);
        }
      }}
      onBlur={() => close(() => onCommit(value))}
      style={{ fieldSizing: 'content' } as CSSProperties}
      className="min-w-0 flex-1 resize-none break-words bg-transparent p-0 text-text-primary outline-none typo-footnote"
    />
  );
};

const TodoRow = ({
  todo,
  isEditing,
  isDragging,
  rowRef,
  onToggle,
  onEdit,
  onCommit,
  onCancel,
  onStep,
  onGrab,
}: {
  todo: TodoItem;
  isEditing: boolean;
  isDragging: boolean;
  rowRef: (node: HTMLLIElement | null) => void;
  onToggle: () => void;
  onEdit: () => void;
  onCommit: (text: string) => void;
  onCancel: () => void;
  onStep: (by: -1 | 1) => void;
  onGrab?: (event: PointerEvent<HTMLSpanElement>) => void;
}): ReactElement => {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.altKey &&
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
    ) {
      event.preventDefault();
      onStep(event.key === 'ArrowUp' ? -1 : 1);
    }
  };

  return (
    <li
      ref={rowRef}
      className={classNames(
        'group/todo relative flex min-h-8 snap-start items-center gap-2.5 rounded-12 py-1.5 pl-2 pr-1 transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none',
        isDragging
          ? 'z-3 bg-surface-float shadow-2'
          : 'focus-within:bg-surface-hover hover:bg-surface-hover',
      )}
    >
      <Check
        isDone={todo.done}
        label={todo.text}
        onToggle={onToggle}
        onKeyDown={onKeyDown}
      />
      {isEditing ? (
        <EditText text={todo.text} onCommit={onCommit} onCancel={onCancel} />
      ) : (
        <button
          type="button"
          onClick={onEdit}
          onKeyDown={onKeyDown}
          disabled={todo.done}
          className={classNames(
            'min-w-0 flex-1 cursor-text break-words text-left transition-colors duration-200 typo-footnote motion-reduce:transition-none',
            todo.done
              ? 'text-text-quaternary line-through'
              : 'text-text-primary',
          )}
        >
          {todo.text}
        </button>
      )}
      {onGrab && (
        <span
          aria-hidden
          onPointerDown={onGrab}
          title="Drag to reorder (or Alt + ↑/↓)"
          className={classNames(
            'flex h-6 w-5 shrink-0 touch-none items-center justify-center rounded-6 text-text-tertiary transition-opacity hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
            isDragging
              ? 'cursor-grabbing opacity-100'
              : 'cursor-grab opacity-0 group-focus-within/todo:opacity-100 group-hover/todo:opacity-100 [@media(pointer:coarse)]:opacity-100',
          )}
        >
          <DragIcon size={IconSize.Size16} />
        </span>
      )}
    </li>
  );
};

/** The input, under the header: Enter adds and keeps it open for the next. */
const AddTodo = ({
  isFull,
  onAdd,
  onClose,
  autoFocus,
}: {
  isFull: boolean;
  onAdd: (text: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
}): ReactElement => {
  const [text, setText] = useState('');
  const inputId = useId();

  if (isFull) {
    return (
      <p className="rounded-12 bg-surface-float px-3 py-2 text-text-tertiary typo-caption1">
        Your list is full. Clear finished to-dos to add more.
      </p>
    );
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && cleanText(text)) {
      onAdd(cleanText(text));
      setText('');
    }
    if (event.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="flex h-9 shrink-0 cursor-text items-center gap-2.5 rounded-12 bg-surface-float px-2 transition-[background-color,box-shadow] duration-150 focus-within:bg-background-default focus-within:ring-2 focus-within:ring-accent-cabbage-default motion-reduce:transition-none"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-max bg-text-primary text-surface-invert">
          <PlusIcon size={IconSize.XXSmall} />
        </span>
        <input
          id={inputId}
          value={text}
          maxLength={TODO_TEXT_MAX_LENGTH}
          aria-label="Add a to-do"
          // Only opened from the header's +, so focus is expected.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a to-do"
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-footnote placeholder:text-text-tertiary"
        />
        <kbd
          aria-hidden
          className={classNames(
            'rounded-6 border border-border-subtlest-secondary px-1.5 text-text-quaternary transition-opacity typo-caption2 motion-reduce:transition-none',
            text ? 'opacity-100' : 'opacity-0',
          )}
        >
          ↵
        </kbd>
      </label>
      {text.length >= TODO_TEXT_MAX_LENGTH && (
        <span className="px-2 text-text-tertiary typo-caption1">
          A to-do fits in {TODO_TEXT_MAX_LENGTH} characters.
        </span>
      )}
    </div>
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
    <div
      role="progressbar"
      aria-label="To-dos done"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className="h-1.5 flex-1 overflow-hidden rounded-max bg-surface-float"
    >
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

type Drag = {
  id: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  originLeft: number;
  originTop: number;
  startOrder: string;
};

const orderOf = (todos: TodoItem[]): string =>
  todos.map(({ id }) => id).join(',');

/**
 * The reader's own short list, saved on this device only (IndexedDB, keyed by
 * the widget). The + in the header opens the input; tick to finish, click the
 * text to edit (clear it to delete), drag the handle or Alt + arrows to
 * reorder. A ticked to-do settles for a beat, then folds into Done.
 */
export const TodoListWidget = ({
  widget,
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.TodoList>): ReactElement => {
  const { logEvent } = useLogContext();
  const scroll = useWidgetScroll();
  const [stored, setStored, isFetched] = usePersistentContext<TodoItem[]>(
    getTodoListStorageKey(widget.id),
    emptyTodos,
  );
  const restored = useMemo(
    () => (isFetched ? parseTodos(stored) : null),
    [isFetched, stored],
  );
  // The list renders from here once touched, never off the store, so a write
  // landing mid-drag cannot snap the order back.
  const [local, setLocal] = useState<TodoItem[] | null>(null);
  const todos = local ?? restored ?? emptyTodos;
  const latest = useRef(todos);
  latest.current = todos;

  const [isAdding, setIsAdding] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settling, setSettling] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const settleTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const rows = useRef(new Map<string, HTMLLIElement>());
  const slots = useRef(new Map<string, { left: number; top: number }>());
  const drag = useRef<Drag | null>(null);

  useEffect(() => {
    const timers = settleTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const update = useCallback(
    (change: (current: TodoItem[]) => TodoItem[], persist = true) => {
      const next = change(latest.current);
      if (next === latest.current) {
        return;
      }
      latest.current = next;
      setLocal(next);
      if (persist) {
        setStored(next);
      }
    },
    [setStored],
  );

  const logTodoEvent = useCallback(
    (eventName: LogEvent, extra?: object) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.FeedWidget,
        target_id: FeedWidgetKind.TodoList,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, size, ...extra }),
      }),
    [logEvent, size],
  );

  const isSettling = (id: string) => settling.includes(id);
  const open = todos.filter((todo) => !todo.done || isSettling(todo.id));
  const finished = todos.filter((todo) => todo.done && !isSettling(todo.id));
  const openCount = todos.filter((todo) => !todo.done).length;
  const doneCount = todos.length - openCount;
  const isFull = todos.length >= TODO_LIST_MAX_ITEMS;

  /* The dragged row follows the pointer from wherever its slot now is. */
  const followPointer = () => {
    const { current } = drag;
    const node = current && rows.current.get(current.id);
    if (!current || !node) {
      return;
    }
    const dx =
      current.originLeft + current.x - current.startX - node.offsetLeft;
    const dy = current.originTop + current.y - current.startY - node.offsetTop;
    node.style.transition = 'none';
    node.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  /* Rows that changed slot glide there instead of jumping (FLIP). */
  useLayoutEffect(() => {
    const isStill = prefersReducedMotion();
    rows.current.forEach((node, id) => {
      const next = { left: node.offsetLeft, top: node.offsetTop };
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
      const { style } = node;
      style.transition = 'none';
      style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        style.transition = `transform 220ms ${ease}`;
        style.transform = '';
      });
    });
    followPointer();
  });

  const reorder = (id: string, targetId: string, persist = true) =>
    update((current) => {
      const from = current.findIndex((todo) => todo.id === id);
      const to = current.findIndex((todo) => todo.id === targetId);
      if (from < 0 || to < 0 || from === to) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    }, persist);

  const step = (id: string, by: -1 | 1) => {
    const ids = latest.current
      .filter((todo) => !todo.done)
      .map((todo) => todo.id);
    const target = ids[ids.indexOf(id) + by];
    if (target) {
      reorder(id, target);
    }
  };

  const grab = (id: string) => (event: PointerEvent<HTMLSpanElement>) => {
    const node = rows.current.get(id);
    if (!node || event.button !== 0) {
      return;
    }
    // The rail's own hold-to-edit must not start under a row being dragged.
    event.stopPropagation();
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture?.(event.pointerId);
    drag.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      originLeft: node.offsetLeft,
      originTop: node.offsetTop,
      startOrder: orderOf(latest.current),
    };
    setDraggingId(id);

    const onMove = (move: globalThis.PointerEvent) => {
      const { current } = drag;
      const self = rows.current.get(id);
      if (!current || !self) {
        return;
      }
      current.x = move.clientX;
      current.y = move.clientY;
      followPointer();
      // Swap with whichever open row's slot is closer than our own.
      const centerX =
        current.originLeft + current.x - current.startX + self.offsetWidth / 2;
      const centerY =
        current.originTop + current.y - current.startY + self.offsetHeight / 2;
      const distance = (row: HTMLLIElement) =>
        Math.hypot(
          row.offsetLeft + row.offsetWidth / 2 - centerX,
          row.offsetTop + row.offsetHeight / 2 - centerY,
        );
      let closest = { id, distance: distance(self) };
      latest.current
        .filter((todo) => !todo.done && todo.id !== id)
        .forEach((todo) => {
          const row = rows.current.get(todo.id);
          const rowDistance = row ? distance(row) : Infinity;
          if (rowDistance < closest.distance) {
            closest = { id: todo.id, distance: rowDistance };
          }
        });
      if (closest.id !== id) {
        reorder(id, closest.id, false);
      }
    };

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      const self = rows.current.get(id);
      const startOrder = drag.current?.startOrder;
      drag.current = null;
      setDraggingId(null);
      if (self) {
        self.style.transition = `transform 200ms ${ease}`;
        self.style.transform = '';
      }
      // One write per drag, however many swaps it took.
      if (startOrder !== orderOf(latest.current)) {
        setStored(latest.current);
      }
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  const stopSettling = (id: string) => {
    clearTimeout(settleTimers.current.get(id));
    settleTimers.current.delete(id);
    setSettling((current) => current.filter((settlingId) => settlingId !== id));
  };

  const toggle = (id: string) => {
    const todo = latest.current.find((item) => item.id === id);
    if (!todo) {
      return;
    }
    update((current) =>
      current.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
    if (todo.done) {
      stopSettling(id);
      return;
    }
    logTodoEvent(LogEvent.CompleteFeedWidgetTodo);
    if (prefersReducedMotion()) {
      return;
    }
    setSettling((current) => [...current, id]);
    settleTimers.current.set(
      id,
      setTimeout(() => stopSettling(id), TODO_SETTLE_MS),
    );
  };

  const commit = (id: string, text: string) => {
    setEditingId(null);
    const cleaned = cleanText(text);
    update((current) =>
      cleaned
        ? current.map((todo) =>
            todo.id === id && todo.text !== cleaned
              ? { ...todo, text: cleaned }
              : todo,
          )
        : current.filter((todo) => todo.id !== id),
    );
    if (!cleaned && latest.current.length === 0) {
      setIsAdding(false);
    }
  };

  const add = (text: string, source: 'input' | 'suggestion') => {
    if (latest.current.length >= TODO_LIST_MAX_ITEMS) {
      return;
    }
    update((current) => [
      ...current,
      { id: createTodoId(), text: cleanText(text), done: false },
    ]);
    logTodoEvent(LogEvent.AddFeedWidgetTodo, { source });
    // The empty state's input becomes the header's, still open for the next.
    if (source === 'input') {
      setIsAdding(true);
    }
  };

  const clearDone = () => {
    update((current) =>
      current.filter((todo) => !todo.done || isSettling(todo.id)),
    );
    if (!latest.current.length) {
      setIsAdding(false);
    }
  };

  if (!restored) {
    return <FeedWidgetLoading />;
  }

  const isSmall = size === FeedWidgetSize.Small;
  const isEmpty = !todos.length;

  const renderRows = (list: TodoItem[]) =>
    list.map((todo) => (
      <TodoRow
        key={todo.id}
        todo={todo}
        isEditing={editingId === todo.id}
        isDragging={draggingId === todo.id}
        rowRef={(node) => {
          if (node) {
            rows.current.set(todo.id, node);
          } else {
            rows.current.delete(todo.id);
            slots.current.delete(todo.id);
          }
        }}
        onToggle={() => toggle(todo.id)}
        onEdit={() => setEditingId(todo.id)}
        onCommit={(text) => commit(todo.id, text)}
        onCancel={() => setEditingId(null)}
        onStep={(by) => step(todo.id, by)}
        onGrab={todo.done ? undefined : grab(todo.id)}
      />
    ));

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={glowStyle}
      />
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        <ChecklistAIcon
          secondary
          size={IconSize.Size16}
          className="shrink-0 text-accent-cabbage-default"
        />
        <span className="truncate font-bold text-text-primary typo-caption1">
          To-do list
        </span>
        {isSmall && !!openCount && (
          <span className="shrink-0 font-bold tabular-nums text-accent-cabbage-default typo-caption1">
            {openCount}
          </span>
        )}
        {!isEmpty && (
          <button
            type="button"
            aria-label={isAdding ? 'Close' : 'Add a to-do'}
            aria-expanded={isAdding}
            onClick={() => setIsAdding((value) => !value)}
            className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-max bg-text-primary text-surface-invert transition-transform active:scale-90 motion-reduce:transition-none"
          >
            <PlusIcon
              size={IconSize.Size16}
              className={classNames(
                'transition-transform duration-200 motion-reduce:transition-none',
                isAdding && 'rotate-45',
              )}
            />
          </button>
        )}
      </header>
      {isEmpty && (
        <div className="flex flex-col px-4">
          <span className="mt-3 font-bold text-text-primary typo-callout">
            What will you get done today?
          </span>
          <div className="mt-2.5">
            <AddTodo isFull={false} onAdd={(text) => add(text, 'input')} />
          </div>
          {!isSmall && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestions.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => add(text, 'suggestion')}
                  className="flex items-center gap-1 rounded-max border border-dashed border-border-subtlest-secondary px-2.5 py-1 text-text-secondary transition-colors typo-caption1 hover:border-accent-cabbage-default hover:text-text-primary motion-reduce:transition-none"
                >
                  <PlusIcon size={IconSize.XXSmall} />
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!isEmpty && isAdding && (
        <div className="mt-2.5 px-4">
          <AddTodo
            autoFocus
            isFull={isFull}
            onAdd={(text) => add(text, 'input')}
            onClose={() => setIsAdding(false)}
          />
        </div>
      )}
      {!isEmpty && !isSmall && (
        <div className="mt-3 px-4">
          <Progress done={doneCount} total={todos.length} />
        </div>
      )}
      {!isEmpty && (
        <div
          ref={scroll.ref}
          onScroll={scroll.onScroll}
          style={scroll.style}
          className={classNames('mt-1 px-2', scroll.className)}
        >
          <div>
            {!open.length && (
              <div
                className={classNames(
                  'flex flex-col items-center gap-1 text-center',
                  isSmall ? 'py-3' : 'py-6',
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-max bg-accent-cabbage-flat text-accent-cabbage-default">
                  <VIcon secondary size={IconSize.Small} />
                </span>
                <span className="font-bold text-text-primary typo-callout">
                  All done
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {doneCount} finished. Nice work.
                </span>
              </div>
            )}
            <ul aria-label="To-dos" className="relative flex flex-col gap-0.5">
              {renderRows(open)}
            </ul>
            {!!finished.length && (
              <div className="mt-2">
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    aria-expanded={isDoneOpen}
                    onClick={() => setIsDoneOpen((value) => !value)}
                    className="flex items-center gap-1 py-1 text-text-tertiary typo-caption1 hover:text-text-primary"
                  >
                    <ArrowIcon
                      size={IconSize.XXSmall}
                      className={classNames(
                        'transition-transform motion-reduce:transition-none',
                        isDoneOpen ? 'rotate-180' : 'rotate-90',
                      )}
                    />
                    Done · {finished.length}
                  </button>
                  <button
                    type="button"
                    onClick={clearDone}
                    className="py-1 text-text-tertiary typo-caption1 hover:text-text-primary"
                  >
                    Clear
                  </button>
                </div>
                {isDoneOpen && (
                  <ul
                    aria-label="Done"
                    className="relative flex flex-col gap-0.5"
                  >
                    {renderRows(finished)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
