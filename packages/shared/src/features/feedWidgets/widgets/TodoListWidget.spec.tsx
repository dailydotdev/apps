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
import nock from 'nock';
import type { GraphQLError } from 'graphql-request/dist/types';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { GraphQLResult } from '../../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import {
  FEED_WIDGET_DATA_QUERY,
  UPDATE_FEED_WIDGET_DATA_MUTATION,
} from '../../../graphql/feedWidgetData';
import { LogEvent, TargetType } from '../../../lib/log';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import type { StoredTodoList, TodoItem } from './TodoListWidget';
import {
  TODO_LIST_DATA_KEY,
  TODO_LIST_MAX_ITEMS,
  TODO_LIST_VERSION,
  TODO_SETTLE_MS,
  TodoListWidget,
} from './TodoListWidget';

const widgetId = 'todo';
const updatedAt = '2026-10-27T08:00:00.000Z';
const logEvent = jest.fn();

type Write = { key: string; data: StoredTodoList; revision: number };
const writes: Write[] = [];
const lastWrite = () => writes[writes.length - 1];
const storedItems = () => lastWrite()?.data.items;

/** What the API holds for the reader when the widget asks. */
const mockRead = (data: object | null, revision = 1) =>
  mockGraphQL({
    request: {
      query: FEED_WIDGET_DATA_QUERY,
      variables: { key: TODO_LIST_DATA_KEY },
    },
    result: {
      data: {
        feedWidgetData: data
          ? { key: TODO_LIST_DATA_KEY, data, revision, updatedAt }
          : null,
      },
    },
  });
const store = (items: unknown[], extra: object = {}, revision = 1) =>
  mockRead({ version: TODO_LIST_VERSION, items, ...extra }, revision);

const saved = (write: Write): GraphQLResult => ({
  data: {
    updateFeedWidgetData: {
      key: write.key,
      data: write.data,
      revision: write.revision + 1,
      updatedAt,
    },
  },
});

/**
 * Takes every save the widget sends, recording it, and answers with the
 * given replies in order, then with success.
 */
const mockSave = (...replies: ((write: Write) => GraphQLResult)[]) =>
  nock('http://localhost:3000')
    .persist()
    .post(
      '/graphql',
      (body) =>
        body.query === UPDATE_FEED_WIDGET_DATA_MUTATION &&
        !!writes.push(body.variables),
    )
    .reply(200, () => (replies.shift() ?? saved)(lastWrite()));

const conflict = (revision: number) => (): GraphQLResult => ({
  errors: [
    {
      message: 'Feed widget data changed since it was read',
      extensions: { code: 'CONFLICT', revision },
    } as unknown as GraphQLError,
  ],
});

const todos: TodoItem[] = [
  { id: 'a', text: 'Review the hero rail PR', done: false },
  { id: 'b', text: 'Read the release notes', done: false },
  { id: 'c', text: 'Book the hackathon room', done: true },
];

const renderWidget = (size = FeedWidgetSize.Tall, client = new QueryClient()) =>
  render(
    <TestBootProvider
      client={client}
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
  writes.length = 0;
  nock.cleanAll();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TodoListWidget', () => {
  it('asks for the first to-do with the input open and suggestions on Tall', async () => {
    mockRead(null);
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
    mockRead(null);
    renderWidget(FeedWidgetSize.Small);

    await screen.findByText('What will you get done today?');
    expect(
      screen.queryByRole('button', { name: 'Read 3 posts today' }),
    ).not.toBeInTheDocument();
  });

  it('adds a to-do on Enter, keeps the input open, and saves it to the account', async () => {
    mockRead(null);
    mockSave();
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
    await waitFor(() =>
      expect(storedItems()).toEqual([
        expect.objectContaining({ text: 'Ship the widget', done: false }),
      ]),
    );
    // Nothing was saved before, so the write expects no row.
    expect(lastWrite()).toMatchObject({ key: TODO_LIST_DATA_KEY, revision: 0 });

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
    store(todos);

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

  it('says the list is unavailable when it could not be read', async () => {
    mockGraphQL({
      request: {
        query: FEED_WIDGET_DATA_QUERY,
        variables: { key: TODO_LIST_DATA_KEY },
      },
      result: {
        errors: [{ message: 'Unexpected error' } as unknown as GraphQLError],
      },
    });

    renderWidget(
      FeedWidgetSize.Tall,
      new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    );

    expect(
      await screen.findByText('Your to-do list is unavailable right now.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('leaves a ticked to-do struck through, then folds it into Done', async () => {
    store(todos);
    mockSave();
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
    store(todos);
    mockSave();
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
    store(todos.map((todo) => ({ ...todo, done: true })));

    renderWidget();

    expect(await screen.findByText('All done')).toBeInTheDocument();
    expect(screen.getByText('3 finished. Nice work.')).toBeInTheDocument();
  });

  it('edits a to-do inline, and deletes it when the text is cleared', async () => {
    store(todos);
    mockSave();
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
    await waitFor(() => expect(storedItems()).toHaveLength(2));
  });

  it('reorders open to-dos with Alt and the arrow keys', async () => {
    store(todos);
    mockSave();
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
    await waitFor(() =>
      expect(storedItems()).toEqual([
        expect.objectContaining({ id: 'b' }),
        expect.objectContaining({ id: 'a' }),
        expect.objectContaining({ id: 'c' }),
      ]),
    );
  });

  it('glides the row a reorder displaced instead of jumping it', async () => {
    const offsetTop = jest
      .spyOn(HTMLElement.prototype, 'offsetTop', 'get')
      .mockImplementation(function rowTop(this: HTMLElement) {
        return this.tagName === 'LI' && this.parentElement
          ? Array.from(this.parentElement.children).indexOf(this) * 32
          : 0;
      });
    store(todos);
    mockSave();
    renderWidget();

    fireEvent.keyDown(
      await screen.findByRole('checkbox', { name: 'Read the release notes' }),
      { key: 'ArrowUp', altKey: true },
    );

    // It starts where it was (one row up) and then glides down to its slot.
    expect(
      screen
        .getByRole('checkbox', { name: 'Review the hero rail PR' })
        .closest('li')?.style.transform,
    ).toBe('translate(0px, -32px)');
    offsetTop.mockRestore();
  });

  it('does not glide a row that moved between the open list and Done', async () => {
    const offsetTop = jest
      .spyOn(HTMLElement.prototype, 'offsetTop', 'get')
      .mockImplementation(function rowTop(this: HTMLElement) {
        return this.tagName === 'LI' && this.parentElement
          ? Array.from(this.parentElement.children).indexOf(this) * 32
          : 0;
      });
    store(todos);
    mockSave();
    renderWidget();

    fireEvent.click(await screen.findByRole('button', { name: /Done · 1/ }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Book the hackathon room' }),
    );

    expect(
      screen
        .getByRole('checkbox', { name: 'Book the hackathon room' })
        .closest('li')?.style.transform,
    ).toBe('');
    offsetTop.mockRestore();
  });

  it('says so when the list is full instead of taking more', async () => {
    store(
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

  it('keeps fields and items this build does not show when it writes', async () => {
    const future = { id: 'f', kind: 'note', body: 'Not a to-do yet' };
    store([{ ...todos[0], dueAt: '2026-11-01' }, future, todos[1]], {
      hidden: false,
    });
    mockSave();
    renderWidget();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Read the release notes' }),
    );

    await waitFor(() =>
      expect(lastWrite()?.data).toEqual({
        version: TODO_LIST_VERSION,
        hidden: false,
        items: [
          { ...todos[0], dueAt: '2026-11-01' },
          future,
          { ...todos[1], done: true },
        ],
      }),
    );
  });

  it('shows a list saved by a newer version read-only and never writes it', async () => {
    mockRead({ version: TODO_LIST_VERSION + 1, items: todos });
    mockSave();
    renderWidget();

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Review the hero rail PR',
    });
    expect(checkbox).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Add a to-do' }),
    ).not.toBeInTheDocument();
    fireEvent.click(checkbox);
    await act(() => Promise.resolve());
    expect(writes).toHaveLength(0);
  });

  it('does not erase what another tab saved, and shows it when the tab is back in view', async () => {
    store(todos);
    const other = { id: 'd', text: 'Added in another tab', done: false };
    // The tick clashes with the other tab's write; the fresh list comes back
    // and the tick is replayed on it.
    mockSave(conflict(2));
    store([...todos, other], {}, 2);
    renderWidget();
    await screen.findByRole('checkbox', { name: 'Review the hero rail PR' });

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Review the hero rail PR' }),
    );

    await waitFor(() =>
      expect(lastWrite()).toMatchObject({
        revision: 2,
        data: {
          items: [{ ...todos[0], done: true }, todos[1], todos[2], other],
        },
      }),
    );
    expect(writes).toHaveLength(2);
    expect(
      screen.queryByText('Couldn’t save your list.'),
    ).not.toBeInTheDocument();

    store([...todos, other], {}, 3);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(
      await screen.findByRole('checkbox', { name: 'Added in another tab' }),
    ).toBeInTheDocument();
  });

  it('saves a tick as done even if another window ticked it first', async () => {
    store(todos);
    mockSave(conflict(2));
    store([{ ...todos[0], done: true }, todos[1], todos[2]], {}, 2);
    renderWidget();
    await screen.findByRole('checkbox', { name: 'Review the hero rail PR' });

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Review the hero rail PR' }),
    );

    await waitFor(() => expect(writes).toHaveLength(2));
    expect(lastWrite()).toMatchObject({
      revision: 2,
      data: { items: [{ ...todos[0], done: true }, todos[1], todos[2]] },
    });
  });

  it('gives up on a conflict that will not clear and says so', async () => {
    store(todos);
    mockSave(conflict(2), conflict(3), conflict(4), conflict(5));
    store(todos, {}, 2);
    store(todos, {}, 3);
    store(todos, {}, 4);
    renderWidget();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Review the hero rail PR' }),
    );

    expect(
      await screen.findByText('Couldn’t save your list.'),
    ).toBeInTheDocument();
    expect(writes).toHaveLength(4);
  });

  it('tells the reader when the list could not be saved', async () => {
    mockRead(null);
    mockSave(() => ({
      errors: [{ message: 'Unexpected error' } as unknown as GraphQLError],
    }));
    renderWidget();

    typeAndEnter(
      await screen.findByRole('textbox', { name: 'Add a to-do' }),
      'Ship the widget',
    );

    expect(
      await screen.findByText('Couldn’t save your list.'),
    ).toBeInTheDocument();
  });
});
