import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { UserInterestStatus } from '../../../graphql/interests';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { AgentMonitorItem, AgentMonitorSource } from '../monitorItems';
import { stateLabel, toMonitorItems } from '../monitorItems';
import { AgentMonitor } from './AgentMonitor';

const now = Date.parse('2026-02-01T12:00:00.000Z');
const hoursAgo = (hours: number) =>
  new Date(now - hours * 60 * 60 * 1000).toISOString();

const interest = (over: Partial<AgentMonitorSource> = {}): AgentMonitorSource =>
  ({
    id: 'i1',
    query: 'Cool zig projects',
    status: UserInterestStatus.Active,
    lastRunAt: hoursAgo(1),
    lastRunSummary: 'Scanned 128 posts, kept 6',
    ...over,
  } as AgentMonitorSource);

describe('toMonitorItems', () => {
  it('calls a recent run with something to say "waiting for review"', () => {
    const [item] = toMonitorItems([interest()], now);

    expect(item.state).toBe('waiting');
    expect(item.line).toBe('Scanned 128 posts, kept 6');
    expect(item.found).toBe(6);
  });

  it('goes back to watching once the run ages out of the window', () => {
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(7) })], now)[0].state,
    ).toBe('watching');
  });

  it('treats the window edge as past', () => {
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(6) })], now)[0].state,
    ).toBe('watching');
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(5.99) })], now)[0].state,
    ).toBe('waiting');
  });

  it('is watching, not waiting, when a recent run found nothing to report', () => {
    expect(
      toMonitorItems([interest({ lastRunSummary: null })], now)[0].state,
    ).toBe('watching');
  });

  it('is watching when the run says in words that it kept nothing', () => {
    ['Scanned 214 posts, kept nothing', 'kept none', 'Kept 0 of 41'].forEach(
      (lastRunSummary) => {
        expect([
          lastRunSummary,
          toMonitorItems([interest({ lastRunSummary })], now)[0].state,
        ]).toEqual([lastRunSummary, 'watching']);
      },
    );
  });

  it('still says what that run found, next to the state', () => {
    expect(
      toMonitorItems(
        [interest({ lastRunSummary: 'Scanned 214 posts, kept nothing' })],
        now,
      )[0].line,
    ).toBe('Scanned 214 posts, kept nothing');
  });

  it('is starting, not watching, before its first run', () => {
    const [item] = toMonitorItems(
      [interest({ lastRunAt: null, lastRunSummary: null })],
      now,
    );

    expect(item.state).toBe('starting');
    expect(item.line).toBe('First run has not happened yet.');
  });

  it('separates an agent you stopped from one you paused', () => {
    expect(
      toMonitorItems([interest({ status: UserInterestStatus.Stopped })], now)[0]
        .state,
    ).toBe('stopped');
    expect(
      toMonitorItems([interest({ status: UserInterestStatus.Paused })], now)[0]
        .state,
    ).toBe('paused');
  });

  describe('the two states the API cannot express yet', () => {
    it('reports a run in flight, whatever the last one said', () => {
      const [item] = toMonitorItems([interest({ runState: 'running' })], now);

      expect(item.state).toBe('running');
    });

    it('lets a run in flight outrank being paused, since it is happening', () => {
      expect(
        toMonitorItems(
          [
            interest({
              runState: 'running',
              status: UserInterestStatus.Paused,
            }),
          ],
          now,
        )[0].state,
      ).toBe('running');
    });

    it('reports a failed run, and says so rather than quoting the old one', () => {
      const [item] = toMonitorItems([interest({ runState: 'failed' })], now);

      expect(item.state).toBe('failed');
      expect(item.line).toBe('Last run did not finish.');
    });

    it('leaves a failed run out of what is waiting for you', () => {
      expect(
        toMonitorItems([interest({ runState: 'failed' })], now)[0].state,
      ).not.toBe('waiting');
    });
  });

  it('is paused whatever the run says, when the agent is off', () => {
    const [paused] = toMonitorItems(
      [interest({ status: UserInterestStatus.Paused })],
      now,
    );

    expect(paused.state).toBe('paused');
    expect(paused.line).toBe('Scanned 128 posts, kept 6');

    const [never] = toMonitorItems(
      [interest({ status: UserInterestStatus.Paused, lastRunSummary: null })],
      now,
    );

    expect(never.line).toBe('Paused. Nothing scheduled.');
  });

  it('gives every state something to say when the agent has not', () => {
    const lines = [
      interest({ lastRunAt: null, lastRunSummary: null }),
      interest({ runState: 'running', lastRunSummary: null }),
      interest({ lastRunAt: hoursAgo(20), lastRunSummary: null }),
      interest({ runState: 'failed' }),
      interest({ status: UserInterestStatus.Paused, lastRunSummary: null }),
      interest({ status: UserInterestStatus.Stopped }),
    ].map((agent) => toMonitorItems([agent], now)[0].line);

    lines.forEach((line) => expect(line.length).toBeGreaterThan(0));
  });

  it('leaves the count off when the summary has no number in it', () => {
    expect(
      toMonitorItems([interest({ lastRunSummary: 'Nothing today' })], now)[0]
        .found,
    ).toBeUndefined();
  });

  it('reads a zero kept as no findings rather than as a count of none', () => {
    expect(
      toMonitorItems(
        [interest({ lastRunSummary: 'Scanned 40, kept 0' })],
        now,
      )[0].found,
    ).toBeUndefined();
  });
});

const item = (over: Partial<AgentMonitorItem> = {}): AgentMonitorItem => ({
  id: 'a1',
  name: 'Cool zig projects',
  state: 'waiting',
  line: 'Scanned 128 posts, kept 6',
  at: hoursAgo(1),
  ...over,
});

const waitingItems = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    item({ id: `w${index}`, name: `Waiting ${index}` }),
  );

const renderMonitor = (items: AgentMonitorItem[], defaultOpen?: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentMonitor items={items} defaultOpen={defaultOpen} />
    </TestBootProvider>,
  );

describe('AgentMonitor', () => {
  it('renders nothing at all when there are no agents', () => {
    const { container } = renderMonitor([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows at most two waiting rows, and counts the rest', () => {
    renderMonitor(waitingItems(5));

    // Counted by their dismiss buttons: the names also appear in the ticker,
    // which is not a row.
    expect(screen.getAllByLabelText(/^Dismiss the update from/)).toHaveLength(
      2,
    );
    expect(
      screen.getByLabelText('Dismiss the update from Waiting 0'),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Dismiss the update from Waiting 2'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Show 3 more')).toBeInTheDocument();
  });

  it('gives each waiting row a way to review it', () => {
    renderMonitor(waitingItems(1));

    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      expect.stringContaining('agent/w0'),
    );
  });

  it('carries the waiting count on the strip', () => {
    renderMonitor([...waitingItems(3), item({ id: 'h', state: 'watching' })]);

    expect(
      screen.getByRole('button', { name: /3 waiting, 4 in total/ }),
    ).toBeInTheDocument();
  });

  it('drops a dismissed row out of the stack and off the count', () => {
    renderMonitor(waitingItems(2));

    fireEvent.click(screen.getByLabelText('Dismiss the update from Waiting 0'));

    expect(
      screen.queryByLabelText('Dismiss the update from Waiting 0'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /1 waiting, 2 in total/ }),
    ).toBeInTheDocument();
  });

  it('has no way to close the strip itself', () => {
    renderMonitor(waitingItems(1));

    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  describe('expanding', () => {
    it('opens on a click anywhere on the strip and shuts on the next one', () => {
      renderMonitor([...waitingItems(1), item({ id: 'h', state: 'watching' })]);
      const strip = screen.getByRole('button', { name: /waiting, 2 in total/ });

      expect(strip).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(strip);
      expect(strip).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(strip);
      expect(strip).toHaveAttribute('aria-expanded', 'false');
    });

    it('lists what came back first, and everything else behind a control', () => {
      renderMonitor([
        ...waitingItems(1),
        item({ id: 'h', name: 'Still hunting', state: 'watching' }),
      ]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText('Waiting 0')).toBeInTheDocument();
      expect(screen.queryByText('Still hunting')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Show all 2 agents'));

      expect(screen.getByText('Still hunting')).toBeInTheDocument();
      expect(screen.queryByText('Show all 2 agents')).not.toBeInTheDocument();
    });

    it('goes straight to every agent when nothing is waiting', () => {
      renderMonitor([
        item({ id: 'h1', name: 'Still hunting', state: 'watching' }),
        item({ id: 'h2', name: 'On pause', state: 'paused' }),
      ]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText('Still hunting')).toBeInTheDocument();
      expect(screen.getByText('On pause')).toBeInTheDocument();
      expect(screen.queryByText(/Show all/)).not.toBeInTheDocument();
    });

    it('names the state on the expanded rows, where there is room for it', () => {
      renderMonitor([item({ id: 'h', state: 'watching' })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText(stateLabel.watching)).toBeInTheDocument();
    });

    it('says the state in one word and means it in full', () => {
      renderMonitor([item({ id: 'h', name: 'Named thing', state: 'waiting' })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(stateLabel.waiting.split(' ')).toHaveLength(1);
      expect(screen.getByText(stateLabel.waiting)).toHaveAttribute(
        'aria-label',
        'Waiting for review',
      );
    });

    it('gives the elapsed time bare, without "ago" on every row', () => {
      const at = new Date(Date.now() - 32 * 60 * 1000).toISOString();
      renderMonitor([item({ id: 'h', state: 'watching', at })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText('32m')).toBeInTheDocument();
      expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
    });

    it('links each expanded row to its agent', () => {
      renderMonitor([item({ id: 'h', name: 'Reachable', state: 'watching' })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      const row = screen.getByText('Reachable').closest('a');

      expect(row).toHaveAttribute('href', expect.stringContaining('agent/h'));
    });

    it('shuts on Escape', () => {
      renderMonitor(waitingItems(1));
      const strip = screen.getByRole('button', { name: /in total/ });

      fireEvent.click(strip);
      // On the body: the shared hook reads the event's composed path, which a
      // window target has no element in.
      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(strip).toHaveAttribute('aria-expanded', 'false');
    });

    it('shuts on a click outside it', () => {
      renderMonitor(waitingItems(1));
      const strip = screen.getByRole('button', { name: /in total/ });

      fireEvent.click(strip);
      fireEvent.click(document.body);

      expect(strip).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens itself when a run lands while you are reading', () => {
      renderMonitor(waitingItems(1), true);

      expect(screen.getByRole('button', { name: /in total/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });
  });

  describe('the ticker', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('turns through the agents while it is shut', () => {
      const items = [
        item({ id: 'a', name: 'First', state: 'watching' }),
        item({ id: 'b', name: 'Second', state: 'watching' }),
      ];
      renderMonitor(items);
      const strip = screen.getByRole('button', { name: /in total/ });

      expect(within(strip).getByText('First')).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(3600));

      expect(within(strip).getByText('Second')).toBeInTheDocument();
    });

    it('stands still with only one agent to show', () => {
      renderMonitor([item({ id: 'a', name: 'Only one', state: 'watching' })]);
      const strip = screen.getByRole('button', { name: /in total/ });

      act(() => jest.advanceTimersByTime(3600 * 3));

      expect(within(strip).getByText('Only one')).toBeInTheDocument();
    });
  });
});
