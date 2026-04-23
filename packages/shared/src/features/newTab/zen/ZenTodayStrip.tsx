import type { ReactElement } from 'react';
import React, { useMemo, useSyncExternalStore } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { summarizeWeek, useFocusHistory } from '../store/focusHistory.store';
import { formatFocusDuration } from './ZenGreeting';

const TODOS_STORAGE_KEY = 'newtab:zen:todos';
const TODOS_CHANGE_EVENT = 'newtab:zen:todos:changed';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

// Local snapshot of the todo list. We read directly from storage here rather
// than importing from ZenTodos to keep ZenTodos' internals encapsulated and
// avoid creating a circular dep between components.
let cachedRaw: string | null = null;
let cachedTodos: Todo[] = [];

const readTodos = (): Todo[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(TODOS_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedTodos;
  }
  let value: Todo[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        value = parsed.filter(
          (entry): entry is Todo =>
            !!entry &&
            typeof (entry as Todo).id === 'string' &&
            typeof (entry as Todo).text === 'string' &&
            typeof (entry as Todo).done === 'boolean',
        );
      }
    } catch {
      value = [];
    }
  }
  cachedRaw = raw;
  cachedTodos = value;
  return value;
};

const subscribeTodos = (cb: () => void): (() => void) => {
  // ZenTodos doesn't currently dispatch a custom event when it mutates
  // storage (it owns the state in-component), so we fall back to the
  // cross-tab `storage` event plus our own for forwards-compatibility.
  window.addEventListener(TODOS_CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(TODOS_CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const formatWeekday = (date: Date): string =>
  date.toLocaleDateString(undefined, { weekday: 'long' });

const formatMonthDay = (date: Date): string =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

interface TileProps {
  label: string;
  value: string;
  hint?: string;
}

const Tile = ({ label, value, hint }: TileProps): ReactElement => (
  <div className="bg-surface-float/60 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-12 border border-border-subtlest-tertiary px-4 py-3 text-center backdrop-blur-sm">
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="uppercase tracking-wider"
    >
      {label}
    </Typography>
    <Typography type={TypographyType.Title3} bold>
      {value}
    </Typography>
    {hint ? (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {hint}
      </Typography>
    ) : null}
  </div>
);

// A three-tile glance strip shown above the intention/todo stack. Lives
// entirely on local state so it paints on first frame and never blocks.
export const ZenTodayStrip = (): ReactElement => {
  const { entries } = useFocusHistory();
  const todos = useSyncExternalStore(subscribeTodos, readTodos, () => []);

  const now = useMemo(() => new Date(), []);
  const focusSummary = useMemo(
    () => summarizeWeek(entries, now),
    [entries, now],
  );

  const completed = todos.filter((todo) => todo.done).length;
  const todosLabel = todos.length === 0 ? '—' : `${completed}/${todos.length}`;
  let todosHint: string;
  if (todos.length === 0) {
    todosHint = 'No tasks yet';
  } else if (completed === todos.length) {
    todosHint = 'All done';
  } else {
    todosHint = `${todos.length - completed} to go`;
  }

  const focusLabel =
    focusSummary.totalMinutes === 0
      ? '—'
      : formatFocusDuration(focusSummary.totalMinutes);
  const focusHint =
    focusSummary.sessions === 0
      ? 'No focus sessions yet'
      : `${focusSummary.sessions} ${
          focusSummary.sessions === 1 ? 'session' : 'sessions'
        } this week`;

  return (
    <section
      aria-label="Today at a glance"
      className="flex w-full max-w-xl flex-col gap-2"
    >
      <div className="flex gap-2">
        <Tile
          label="Today"
          value={formatWeekday(now)}
          hint={formatMonthDay(now)}
        />
        <Tile label="Tasks" value={todosLabel} hint={todosHint} />
        <Tile label="Focus" value={focusLabel} hint={focusHint} />
      </div>
    </section>
  );
};
