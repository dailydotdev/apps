import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { get, set } from 'idb-keyval';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { LogEvent, TargetType } from '../../../lib/log';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import type { TodoItem } from './TodoListWidget';
import {
  TODO_LIST_MAX_ITEMS,
  TODO_SETTLE_MS,
  TodoListWidget,
  getTodoListStorageKey,
} from './TodoListWidget';

const widgetId = 'todo';
const storageKey = getTodoListStorageKey(widgetId);
const logEvent = jest.fn();

const todos: TodoItem[] = [
  { id: 'a', text: 'Review the hero rail PR', done: false },
  { id: 'b', text: 'Read the release notes', done: false },
  { id: 'c', text: 'Book the hackathon room', done: true },
];

const renderWidget = (size = FeedWidgetSize.Tall) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isLoggedIn: true }}
      log={{ logEvent }}
    >
      <TodoListWidget
        widget={{ id: widgetId, kind: FeedWidgetKind.TodoList, size }}
        size={size}
        isEditing={false}
        onConfigChange={() => false}
        canConfigure={false}
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
    </TestBootProvider>,
  );

const openTexts = () =>
  within(screen.getByRole('list', { name: 'To-dos' }))
    .queryAllByRole('checkbox')
    .map((checkbox) => checkbox.getAttribute('aria-label'));

const typeAndEnter = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

beforeEach(() => {
  logEvent.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TodoListWidget', () => {
  it('asks for the first to-do with the input open and suggestions on Tall', async () => {
    renderWidget();

    expect(
      await screen.findByText('What will you get done today?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Add a to-do' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Read 3 posts today' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add a to-do' }),
    ).not.toBeInTheDocument();
  });

  it('offers no suggestions on Small', async () => {
    renderWidget(FeedWidgetSize.Small);

    await screen.findByText('What will you get done today?');
    expect(
      screen.queryByRole('button', { name: 'Read 3 posts today' }),
    ).not.toBeInTheDocument();
  });

  it('adds a to-do on Enter, keeps the input open, and saves it on this device', async () => {
    renderWidget();

    const input = await screen.findByRole('textbox', { name: 'Add a to-do' });
    typeAndEnter(input, '  Ship the widget  ');

    expect(openTexts()).toEqual(['Ship the widget']);
    expect(screen.getByText('0 of 1 done')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.AddFeedWidgetTodo,
      target_type: TargetType.FeedWidget,
      target_id: FeedWidgetKind.TodoList,
      extra: JSON.stringify({
        origin: 'feed widgets',
        size: FeedWidgetSize.Tall,
        source: 'input',
      }),
    });
    await waitFor(async () =>
      expect(await get(storageKey)).toEqual([
        expect.objectContaining({ text: 'Ship the widget', done: false }),
      ]),
    );

    const nextInput = screen.getByRole('textbox', { name: 'Add a to-do' });
    expect(nextInput).toHaveValue('');
    fireEvent.keyDown(nextInput, { key: 'Escape' });
    expect(
      screen.queryByRole('textbox', { name: 'Add a to-do' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add a to-do' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reads the saved list on mount, with the open count on Small', async () => {
    await set(storageKey, todos);

    renderWidget(FeedWidgetSize.Small);

    expect(
      await screen.findByRole('checkbox', { name: 'Review the hero rail PR' }),
    ).toBeInTheDocument();
    expect(openTexts()).toEqual([
      'Review the hero rail PR',
      'Read the release notes',
    ]);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done · 1/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('leaves a ticked to-do struck through, then folds it into Done', async () => {
    await set(storageKey, todos);
    renderWidget();
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Read the release notes',
    });
    jest.useFakeTimers();

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(openTexts()).toContain('Read the release notes');
    expect(screen.getByText('2 of 3 done')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.CompleteFeedWidgetTodo }),
    );

    act(() => {
      jest.advanceTimersByTime(TODO_SETTLE_MS);
    });

    expect(openTexts()).toEqual(['Review the hero rail PR']);
    const doneToggle = screen.getByRole('button', { name: /Done · 2/ });
    fireEvent.click(doneToggle);
    expect(
      within(screen.getByRole('list', { name: 'Done' })).getAllByRole(
        'checkbox',
      ),
    ).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(
      screen.queryByRole('button', { name: /Done ·/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('0 of 1 done')).toBeInTheDocument();
  });

  it('keeps a settling to-do in place and hands its focus on once it folds', async () => {
    await set(storageKey, todos);
    renderWidget();
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Review the hero rail PR',
    });
    jest.useFakeTimers();

    checkbox.focus();
    fireEvent.click(checkbox);
    fireEvent.keyDown(checkbox, { key: 'ArrowDown', altKey: true });
    expect(openTexts()).toEqual([
      'Review the hero rail PR',
      'Read the release notes',
    ]);

    act(() => {
      jest.advanceTimersByTime(TODO_SETTLE_MS);
    });

    expect(
      screen.getByRole('checkbox', { name: 'Read the release notes' }),
    ).toHaveFocus();
  });

  it('shows All done once every to-do is finished', async () => {
    await set(
      storageKey,
      todos.map((todo) => ({ ...todo, done: true })),
    );

    renderWidget();

    expect(await screen.findByText('All done')).toBeInTheDocument();
    expect(screen.getByText('3 finished. Nice work.')).toBeInTheDocument();
  });

  it('edits a to-do inline, and deletes it when the text is cleared', async () => {
    await set(storageKey, todos);
    renderWidget();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Review the hero rail PR' }),
    );
    const editor = screen.getByRole('textbox', { name: 'Edit to-do' });
    expect(editor).toHaveFocus();
    typeAndEnter(editor, 'Review and merge the PR');
    expect(openTexts()).toEqual([
      'Review and merge the PR',
      'Read the release notes',
    ]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Read the release notes' }),
    );
    const cancelled = screen.getByRole('textbox', { name: 'Edit to-do' });
    fireEvent.change(cancelled, { target: { value: 'Something else' } });
    fireEvent.keyDown(cancelled, { key: 'Escape' });
    expect(openTexts()).toContain('Read the release notes');

    fireEvent.click(
      screen.getByRole('button', { name: 'Read the release notes' }),
    );
    const cleared = screen.getByRole('textbox', { name: 'Edit to-do' });
    fireEvent.change(cleared, { target: { value: '' } });
    fireEvent.blur(cleared);

    expect(openTexts()).toEqual(['Review and merge the PR']);
    await waitFor(async () => expect(await get(storageKey)).toHaveLength(2));
  });

  it('reorders open to-dos with Alt and the arrow keys', async () => {
    await set(storageKey, todos);
    renderWidget();

    const second = await screen.findByRole('checkbox', {
      name: 'Read the release notes',
    });
    fireEvent.keyDown(second, { key: 'ArrowUp', altKey: true });
    expect(openTexts()).toEqual([
      'Read the release notes',
      'Review the hero rail PR',
    ]);

    // The first row cannot go higher, nor the last open one past Done.
    fireEvent.keyDown(second, { key: 'ArrowUp', altKey: true });
    fireEvent.keyDown(
      screen.getByRole('checkbox', { name: 'Review the hero rail PR' }),
      { key: 'ArrowDown', altKey: true },
    );
    expect(openTexts()).toEqual([
      'Read the release notes',
      'Review the hero rail PR',
    ]);
    await waitFor(async () =>
      expect(await get(storageKey)).toEqual([
        expect.objectContaining({ id: 'b' }),
        expect.objectContaining({ id: 'a' }),
        expect.objectContaining({ id: 'c' }),
      ]),
    );
  });

  it('says so when the list is full instead of taking more', async () => {
    await set(
      storageKey,
      Array.from({ length: TODO_LIST_MAX_ITEMS }, (_, index) => ({
        id: `${index}`,
        text: `To-do ${index}`,
        done: false,
      })),
    );
    renderWidget();

    fireEvent.click(await screen.findByRole('button', { name: 'Add a to-do' }));

    expect(
      screen.getByText('Your list is full. Clear finished to-dos to add more.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Add a to-do' }),
    ).not.toBeInTheDocument();
  });
});
