import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ReactModal from 'react-modal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { ActionType } from '../../../graphql/actions';
import { LogEvent, TargetType } from '../../../lib/log';
import { StreakGoalPromptReason } from '../../../lib/streakGoal';
import type { ToastNotification } from '../../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import type { StreakGoalModalProps } from './StreakGoalModal';
import { StreakGoalModal } from './StreakGoalModal';

ReactModal.setAppElement('body');

const mockCompleteAction = jest.fn();
jest.mock('../../../hooks/useActions', () => ({
  useActions: () => ({
    completeAction: mockCompleteAction,
    checkHasCompleted: () => false,
    isActionsFetched: true,
    actions: [],
  }),
}));

const logEvent = jest.fn();
const updateStreakGoal = jest.fn().mockResolvedValue(undefined);
const onRequestClose = jest.fn();

const renderComponent = (
  props: Partial<StreakGoalModalProps> = {},
  client = new QueryClient(),
) =>
  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      settings={{ updateStreakGoal }}
      log={{ logEvent }}
    >
      <StreakGoalModal
        isOpen
        onRequestClose={onRequestClose}
        reason={StreakGoalPromptReason.DayTwo}
        {...props}
      />
    </TestBootProvider>,
  );

describe('StreakGoalModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers the three goals and logs an impression', () => {
    renderComponent();

    expect(
      screen
        .getAllByRole('radio', { hidden: true })
        .map((el) => el.textContent),
    ).toEqual(['7 days', '14 days', '30 days']);
    expect(
      screen.getByRole('button', { name: 'Commit to my goal', hidden: true }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'No goal for now', hidden: true }),
    ).toBeEnabled();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakGoal,
      target_id: StreakGoalPromptReason.DayTwo,
    });
  });

  it('saves and logs the picked goal', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('streak-goal-option-14'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Commit to my goal', hidden: true }),
    );

    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
    expect(updateStreakGoal).toHaveBeenCalledWith(14);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SetStreakGoal,
      target_type: TargetType.StreakGoal,
      target_id: StreakGoalPromptReason.DayTwo,
      extra: JSON.stringify({ goal: 14 }),
    });
    expect(mockCompleteAction).not.toHaveBeenCalled();
  });

  it('keeps the modal open and shows an error when the save fails', async () => {
    const client = new QueryClient();
    updateStreakGoal.mockRejectedValueOnce(new Error('offline'));
    renderComponent({}, client);

    fireEvent.click(screen.getByTestId('streak-goal-option-14'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Commit to my goal', hidden: true }),
    );

    await waitFor(() =>
      expect(
        client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY)?.message,
      ).toBe(labels.error.generic),
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.SetStreakGoal }),
    );
    expect(
      screen.getByRole('button', { name: 'Commit to my goal', hidden: true }),
    ).toBeEnabled();
  });

  it('logs the skip and remembers it for the day-2 offer', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'No goal for now', hidden: true }),
    );

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SkipStreakGoal,
      target_type: TargetType.StreakGoal,
      target_id: StreakGoalPromptReason.DayTwo,
    });
    expect(mockCompleteAction).toHaveBeenCalledWith(
      ActionType.StreakGoalSkipped,
    );
    expect(updateStreakGoal).not.toHaveBeenCalled();
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('preselects the next goal', () => {
    renderComponent({
      reason: StreakGoalPromptReason.NextGoal,
      preselectedGoal: 30,
    });

    expect(screen.getByTestId('streak-goal-option-30')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Commit to my goal', hidden: true }),
    ).toBeEnabled();
  });
});
