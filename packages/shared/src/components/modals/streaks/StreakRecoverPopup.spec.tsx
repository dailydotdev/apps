import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { Alerts } from '../../../graphql/alerts';
import * as actionHook from '../../../hooks/useActions';
import { BootPopups } from '../BootPopups';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import {
  USER_STREAK_RECOVER_QUERY,
  UserStreakRecoverData,
} from '../../../graphql/users';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';

interface TestProps {
  user?: LoggedUser | null;
  alerts?: Alerts;
}

const defaultAlerts: Alerts = {
  filter: true,
  rankLastSeen: null,
  bootPopup: true,
};

const alertsWithStreakRecovery: Alerts = {
  ...defaultAlerts,
  streakRecovery: true,
};

const checkHasCompleted = jest.fn();

const queryClient = new QueryClient({});

const renderComponent = (props: TestProps) => {
  const {
    user = { ...loggedUser, reputation: 10 },
    alerts = alertsWithStreakRecovery,
  } = props;

  return render(
    <TestBootProvider client={queryClient} auth={{ user }} alerts={{ alerts }}>
      <BootPopups />
    </TestBootProvider>,
  );
};

const mockRecoveryQuery = (
  data: UserStreakRecoverData,
  callback?: () => void,
) => {
  mockGraphQL<{ recoverStreak: UserStreakRecoverData }>({
    request: {
      query: USER_STREAK_RECOVER_QUERY,
    },
    result: () => {
      callback?.();
      return {
        data: { recoverStreak: data },
      };
    },
  });
};

beforeEach(async () => {
  jest.spyOn(actionHook, 'useActions').mockReturnValue({
    completeAction: jest.fn(),
    checkHasCompleted,
    isActionsFetched: true,
    actions: [],
  });
});

it('should not render if user is not logged in', async () => {
  renderComponent({ user: null, alerts: defaultAlerts });
  const popup = screen.queryByLabelText('Recover your streak');
  expect(popup).not.toBeInTheDocument();
});

it('should not render if not logged && "recoverStreak" is true from boot', async () => {
  renderComponent({ user: null });
  const popup = screen.queryByLabelText('Restore my streak');
  expect(popup).not.toBeInTheDocument();
});

it('should never render if user disabled this popup', async () => {
  checkHasCompleted.mockReturnValue(true);
  renderComponent({});
  await waitForNock();
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).not.toBeInTheDocument();
});

it('should render and fetch initial data if logged user can recover streak', async () => {
  renderComponent({});

  let mutationCalled = false;

  mockGraphQL({
    request: {
      query: USER_STREAK_RECOVER_QUERY,
    },
    result: () => {
      mutationCalled = true;
      return {
        data: {
          recoverStreak: {
            canDo: true,
            amount: 25,
            length: 10,
          },
        },
      };
    },
  });

  // fetched
  await waitFor(() => expect(mutationCalled).toBeTruthy());

  // and rendered
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).toBeInTheDocument();
});

it('Should have no cost for first time recovery', async () => {
  mockRecoveryQuery({
    canDo: true,
    amount: 0,
    length: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 10,
    },
  });

  await waitForNock();

  // expect cost to be 0
  await waitFor(() => {
    const cost = screen.queryByLabelText('0 Rep');
    expect(cost).toBeInTheDocument();
  });
});

it('Should have cost of 25 points for 2nd+ time recovery', async () => {
  mockRecoveryQuery({
    canDo: true,
    amount: 25,
    length: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  // expect cost to be 25
  const cost = await screen.findByLabelText('25 Rep');
  expect(cost).toBeInTheDocument();
});

it('Should show not enough points message if user does not have enough points', async () => {
  mockRecoveryQuery({
    canDo: false,
    amount: 25,
    length: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 0,
    },
  });

  // expect not enough points message
  const notEnoughPoints = await screen.findByLabelText(
    'You don’t have enough reputation points to restore your streaks.',
  );
  expect(notEnoughPoints).toBeInTheDocument();
});

it('Should show success message on recover', async () => {
  renderComponent({
    user: { ...loggedUser, reputation: 50 },
  });
  // click recover
  const recoverButton = await screen.findByLabelText('Restore my streak');
  fireEvent.click(recoverButton);
  // expect success message
  const successMessage = await screen.findByLabelText(
    'Lucky you! Your streak has been restored',
  );
  expect(successMessage).toBeInTheDocument();
});

it('Should show error message on recover fail', async () => {
  renderComponent({
    user: { ...loggedUser, reputation: 50 },
  });
  // click recover
  const recoverButton = await screen.findByLabelText('Restore my streak');
  fireEvent.click(recoverButton);
  // expect error message
  const errorMessage = await screen.findByLabelText(
    'Oops! Something went wrong. Please try again',
  );
  expect(errorMessage).toBeInTheDocument();
});

it('Should dismiss popup on close if checked option', async () => {
  const action = 'hide_streak_recovery';
});
