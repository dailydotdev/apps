import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReminderPushOnly } from './ReminderPushOnly';
import { FunnelProgressContext } from '../../../features/onboarding/shared/FunnelStepDots';
import type { ReminderOutcome } from '../FeedPatchy/useFeedPatchyReminder';

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
        <ReminderPushOnly onComplete={onComplete} />
      </FunnelProgressContext.Provider>
    </QueryClientProvider>,
  );

const press = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));

describe('ReminderPushOnly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves the reminder at 9 and turns notifications on in one tap', async () => {
    mockOnSchedule.mockResolvedValue('granted');
    renderStep();

    expect(
      screen.getByText('Why Shopify Migrated From React Native'),
    ).toBeInTheDocument();
    press('Turn on notifications');

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(mockOnSchedule).toHaveBeenCalledWith(9, 'Europe/London');
  });

  it('ends the step without a reminder on skip', () => {
    renderStep();

    press('Skip');

    expect(mockOnSkip).toHaveBeenCalled();
    expect(mockOnSchedule).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows how to turn notifications back on when they are refused', async () => {
    mockOnSchedule.mockResolvedValue('denied');
    renderStep();

    press('Turn on notifications');

    expect(
      await screen.findByText('Notifications are off'),
    ).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    press('Continue');
    expect(onComplete).toHaveBeenCalled();
  });
});
