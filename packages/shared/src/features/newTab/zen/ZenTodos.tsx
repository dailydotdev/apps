import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Checkbox } from '../../../components/fields/Checkbox';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, PlusIcon } from '../../../components/icons';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = 'newtab:zen:todos';
const MAX_TODOS = 5;
const MAX_LENGTH = 120;

const generateId = (): string =>
  `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const readTodos = (): Todo[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item): item is Todo =>
          !!item &&
          typeof item.id === 'string' &&
          typeof item.text === 'string' &&
          typeof item.done === 'boolean',
      )
      .slice(0, MAX_TODOS);
  } catch {
    return [];
  }
};

const writeTodos = (todos: Todo[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  // Broadcast so other subscribers in the same tab (e.g. ZenTodayStrip) can
  // re-read. `storage` events only fire across tabs, so we need our own.
  window.dispatchEvent(new CustomEvent('newtab:zen:todos:changed'));
};

export const ZenTodos = (): ReactElement => {
  const { logEvent } = useLogContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(readTodos());
  }, []);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const commit = useCallback((next: Todo[]) => {
    setTodos(next);
    writeTodos(next);
  }, []);

  const onAdd = useCallback(() => {
    const text = draft.trim().slice(0, MAX_LENGTH);
    if (!text) {
      setIsAdding(false);
      setDraft('');
      return;
    }
    const next = [...todos, { id: generateId(), text, done: false }].slice(
      0,
      MAX_TODOS,
    );
    commit(next);
    setDraft('');
    setIsAdding(todos.length + 1 < MAX_TODOS);
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'todo_add',
    });
  }, [commit, draft, logEvent, todos]);

  const onToggle = useCallback(
    (id: string) => {
      const next = todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      );
      commit(next);
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'todo_toggle',
      });
    },
    [commit, logEvent, todos],
  );

  const onDelete = useCallback(
    (id: string) => {
      const next = todos.filter((todo) => todo.id !== id);
      commit(next);
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'todo_delete',
      });
    },
    [commit, logEvent, todos],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onAdd();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsAdding(false);
      setDraft('');
    }
  };

  const canAddMore = todos.length < MAX_TODOS;

  return (
    <section
      aria-label="Today's tasks"
      className="flex w-full max-w-xl flex-col gap-1"
    >
      <ul className="flex flex-col">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-center gap-3 rounded-8 px-2 py-1.5 hover:bg-surface-float"
          >
            <Checkbox
              name={`zen-todo-${todo.id}`}
              checked={todo.done}
              onToggleCallback={() => onToggle(todo.id)}
            >
              <Typography
                type={TypographyType.Body}
                color={
                  todo.done ? TypographyColor.Tertiary : TypographyColor.Primary
                }
                className={classNames(todo.done && 'line-through')}
              >
                {todo.text}
              </Typography>
            </Checkbox>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<MiniCloseIcon />}
              aria-label={`Delete task: ${todo.text}`}
              className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onDelete(todo.id)}
            />
          </li>
        ))}
      </ul>

      {isAdding && canAddMore && (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onBlur={onAdd}
            onKeyDown={onKeyDown}
            maxLength={MAX_LENGTH}
            placeholder="Add a task"
            className="flex-1 bg-transparent text-text-primary typo-body placeholder:text-text-quaternary focus:outline-none"
            aria-label="New task"
          />
        </div>
      )}

      {!isAdding && canAddMore && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={() => setIsAdding(true)}
          className="self-start"
        >
          {todos.length === 0 ? 'Add your first task' : 'Add task'}
        </Button>
      )}
    </section>
  );
};
