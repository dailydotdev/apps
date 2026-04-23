import React from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  clearFocusHistory,
  summarizeWeek,
  useFocusHistory,
} from './focusHistory.store';

const Probe = (): JSX.Element => {
  const { entries, record } = useFocusHistory();
  return (
    <div>
      <span data-testid="count">{entries.length}</span>
      <span data-testid="total">
        {entries.reduce((acc, entry) => acc + entry.durationMinutes, 0)}
      </span>
      <button
        type="button"
        onClick={() => record({ completedAt: Date.now(), durationMinutes: 25 })}
      >
        record
      </button>
    </div>
  );
};

describe('focusHistory.store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearFocusHistory();
  });

  it('defaults to empty history', () => {
    render(<Probe />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('appends recorded sessions', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('record').click();
      screen.getByText('record').click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('50');
  });

  describe('summarizeWeek', () => {
    it('sums only entries in the current week', () => {
      const now = new Date('2026-04-23T10:00:00'); // Thursday
      const inside = now.getTime() - 2 * 24 * 60 * 60 * 1000; // Tuesday
      const lastWeek = now.getTime() - 10 * 24 * 60 * 60 * 1000;

      const summary = summarizeWeek(
        [
          { completedAt: inside, durationMinutes: 25 },
          { completedAt: lastWeek, durationMinutes: 50 },
        ],
        now,
      );
      expect(summary.totalMinutes).toBe(25);
      expect(summary.sessions).toBe(1);
    });
  });
});
