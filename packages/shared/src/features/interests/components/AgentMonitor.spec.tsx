import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { UserInterest } from '../../../graphql/interests';
import { UserInterestStatus } from '../../../graphql/interests';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { AgentMonitorItem } from './AgentMonitor';
import { AgentMonitor, stateLabel, toMonitorItems } from './AgentMonitor';

const now = Date.parse('2026-02-01T12:00:00.000Z');
const hoursAgo = (hours: number) =>
  new Date(now - hours * 60 * 60 * 1000).toISOString();

const interest = (over: Partial<UserInterest> = {}): UserInterest =>
  ({
    id: 'i1',
    query: 'Cool zig projects',
    status: UserInterestStatus.Active,
    lastRunAt: hoursAgo(1),
    lastRunSummary: 'Scanned 128 posts, kept 6',
    ...over,
  } as UserInterest);

describe('toMonitorItems', () => {
  it('calls a run that landed inside the window, with something to say, new', () => {
    const [item] = toMonitorItems([interest()], now);

    expect(item.state).toBe('new');
    expect(item.line).toBe('Scanned 128 posts, kept 6');
    expect(item.found).toBe(6);
  });

  it('goes back to hunting once the run ages out of the window', () => {
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(7) })], now)[0].state,
    ).toBe('hunting');
  });

  // Six hours exactly is outside the window, not inside it.
  it('treats the window edge as past', () => {
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(6) })], now)[0].state,
    ).toBe('hunting');
    expect(
      toMonitorItems([interest({ lastRunAt: hoursAgo(5.99) })], now)[0].state,
    ).toBe('new');
  });

  it('is hunting, not new, when a recent run found nothing to report', () => {
    expect(
      toMonitorItems([interest({ lastRunSummary: null })], now)[0].state,
    ).toBe('hunting');
  });

  it('is paused whatever the run says, when the agent is off', () => {
    const [paused] = toMonitorItems(
      [interest({ status: UserInterestStatus.Paused })],
      now,
    );

    expect(paused.state).toBe('paused');
    // The last run still reads as the line — it is the truest thing to say
    // about an agent that has stopped.
    expect(paused.line).toBe('Scanned 128 posts, kept 6');

    const [never] = toMonitorItems(
      [interest({ status: UserInterestStatus.Paused, lastRunSummary: null })],
      now,
    );

    expect(never.line).toBe('Paused. Nothing scheduled.');
  });

  it('has a line to show for an agent that has never run', () => {
    const [item] = toMonitorItems(
      [interest({ lastRunAt: null, lastRunSummary: null })],
      now,
    );

    expect(item.line).toBe('Hunting. Nothing yet.');
    expect(item.found).toBeUndefined();
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
  state: 'new',
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

    // One dismiss per waiting row, so counting them counts the rows — the
    // names themselves also appear in the ticker, which is not a row.
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
    renderMonitor([...waitingItems(3), item({ id: 'h', state: 'hunting' })]);

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

  // The bar over the feed is the only place a finished run reports back, so it
  // must not be dismissable as a whole.
  it('has no way to close the strip itself', () => {
    renderMonitor(waitingItems(1));

    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  describe('expanding', () => {
    it('opens on a click anywhere on the strip and shuts on the next one', () => {
      renderMonitor([...waitingItems(1), item({ id: 'h', state: 'hunting' })]);
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
        item({ id: 'h', name: 'Still hunting', state: 'hunting' }),
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
        item({ id: 'h1', name: 'Still hunting', state: 'hunting' }),
        item({ id: 'h2', name: 'On pause', state: 'paused' }),
      ]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText('Still hunting')).toBeInTheDocument();
      expect(screen.getByText('On pause')).toBeInTheDocument();
      expect(screen.queryByText(/Show all/)).not.toBeInTheDocument();
    });

    it('names the state on the expanded rows, where there is room for it', () => {
      renderMonitor([item({ id: 'h', state: 'hunting' })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      expect(screen.getByText(stateLabel.hunting)).toBeInTheDocument();
    });

    it('links each expanded row to its agent', () => {
      renderMonitor([item({ id: 'h', name: 'Reachable', state: 'hunting' })]);

      fireEvent.click(screen.getByRole('button', { name: /in total/ }));

      const row = screen.getByText('Reachable').closest('a');

      expect(row).toHaveAttribute('href', expect.stringContaining('agent/h'));
    });

    it('shuts on Escape', () => {
      renderMonitor(waitingItems(1));
      const strip = screen.getByRole('button', { name: /in total/ });

      fireEvent.click(strip);
      // On the body, which is where a keypress lands with nothing focused —
      // the shared hook reads the event's composed path and a window target
      // has no element in it.
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
        item({ id: 'a', name: 'First', state: 'hunting' }),
        item({ id: 'b', name: 'Second', state: 'hunting' }),
      ];
      renderMonitor(items);
      const strip = screen.getByRole('button', { name: /in total/ });

      expect(within(strip).getByText('First')).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(3600));

      expect(within(strip).getByText('Second')).toBeInTheDocument();
    });

    it('stands still with only one agent to show', () => {
      renderMonitor([item({ id: 'a', name: 'Only one', state: 'hunting' })]);
      const strip = screen.getByRole('button', { name: /in total/ });

      act(() => jest.advanceTimersByTime(3600 * 3));

      expect(within(strip).getByText('Only one')).toBeInTheDocument();
    });
  });
});
