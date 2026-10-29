import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingCommitment } from './ReadingCommitment';
import { FunnelProgressContext } from '../../../features/onboarding/shared/FunnelStepDots';
import type { ReminderOutcome } from '../FeedPatchy/useFeedPatchyReminder';
import { LogEvent } from '../../../lib/log';

const mockOnSkip = jest.fn();
const mockOnSchedule = jest.fn<Promise<ReminderOutcome>, [number, string]>();

jest.mock('../FeedPatchy/useFeedPatchyReminder', () => ({
  useFeedPatchyReminder: () => ({
    isBlocked: () => false,
    onCommit: jest.fn(),
    onSchedule: mockOnSchedule,
    onSkip: mockOnSkip,
  }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', timezone: 'Europe/London' } }),
}));

const mockLogEvent = jest.fn();
jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const onComplete = jest.fn();

const renderStep = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <FunnelProgressContext.Provider
        value={{
          chapters: [{ steps: 7 }],
          position: { chapter: 0, step: 4 },
          isOnboarding: true,
        }}
      >
        <ReadingCommitment onComplete={onComplete} />
      </FunnelProgressContext.Provider>
    </QueryClientProvider>,
  );

const pick = (name: RegExp) =>
  fireEvent.click(screen.getByRole('checkbox', { name }));
const proceed = (name = 'Continue') =>
  fireEvent.click(screen.getByRole('button', { name }));

const reachReminder = () => {
  pick(/^A post or two/);
  proceed();
  pick(/^A steady habit/);
  proceed();
  pick(/^Evening/);
  proceed();
};

describe('ReadingCommitment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollTo = jest.fn();
  });

  it('saves the reminder at the picked hour once notifications are on', async () => {
    mockOnSchedule.mockResolvedValue('granted');
    renderStep();

    pick(/^A post or two/);
    proceed();
    pick(/^A steady habit/);
    proceed();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.CommitOnboarding,
      extra: JSON.stringify({
        today_minutes: 5,
        goal_minutes: 15,
        variant: 'reading_commitment',
      }),
    });

    proceed();
    expect(
      await screen.findByText('Why Shopify Migrated From React Native'),
    ).toBeInTheDocument();
    expect(screen.getByText('Top pick for you')).toBeInTheDocument();
    proceed('Turn on notifications');

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(mockOnSchedule).toHaveBeenCalledWith(9, 'Europe/London');
  });

  it('ends the step without a reminder on skip', () => {
    renderStep();
    reachReminder();

    proceed('Skip for now');

    expect(mockOnSkip).toHaveBeenCalled();
    expect(mockOnSchedule).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows how to turn notifications back on when they are refused', async () => {
    mockOnSchedule.mockResolvedValue('denied');
    renderStep();
    reachReminder();

    proceed('Turn on notifications');

    expect(
      await screen.findByText('Notifications are off'),
    ).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    proceed();
    expect(onComplete).toHaveBeenCalled();
  });

  it('steps back a screen and keeps the answers given', () => {
    renderStep();
    pick(/^A post or two/);
    proceed();
    pick(/^A steady habit/);
    proceed();

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(screen.getByText('Set your daily goal')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /^A steady habit/ }),
    ).toHaveAttribute('aria-checked', 'true');
  });
});
