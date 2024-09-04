import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { Alerts, UPDATE_ALERTS } from '../../../graphql/alerts';
import { BootPopups } from '../BootPopups';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import {
  USER_STREAK_RECOVER_MUTATION,
  USER_STREAK_RECOVER_QUERY,
  UserStreakRecoverData,
} from '../../../graphql/users';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import * as actionHook from '../../../hooks/useActions';
import { ActionType } from '../../../graphql/actions';
import Toast from '../../notifications/Toast';

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
  showRecoverStreak: true,
};

const checkHasCompleted = jest.fn();
const completeAction = jest.fn();
const updateAlerts = jest.fn();

const queryClient = new QueryClient({});

const renderComponent = (props: TestProps) => {
  const {
    user = { ...loggedUser, reputation: 10 },
    alerts = alertsWithStreakRecovery,
  } = props;

  return render(
    <TestBootProvider
      client={queryClient}
      auth={{ user }}
      alerts={{ alerts, updateAlerts }}
    >
      <BootPopups />
      <Toast autoDismissNotifications={false} />
    </TestBootProvider>,
  );
};

const mockRecoveryQuery = (
  data: UserStreakRecoverData,
  callback?: () => void,
) => {
  mockGraphQL<{ streakRecover: UserStreakRecoverData }>({
    request: {
      query: USER_STREAK_RECOVER_QUERY,
    },
    result: () => {
      callback?.();
      return {
        data: { streakRecover: data },
      };
    },
  });
};

const mockRecoveryMutation = (data: unknown, callback?: () => void) => {
  mockGraphQL({
    request: {
      query: USER_STREAK_RECOVER_MUTATION,
    },
    result: () => {
      callback?.();
      return {
        data: { recoverStreak: data },
      };
    },
  });
};

const mockAlertsMutation = () => {
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: {
        data: {
          showRecoverStreak: false,
        },
      },
    },
    result: {
      data: {
        updateAlerts: {},
      },
    },
  });
};

beforeEach(async () => {
  // need to reset the mock on useActions
  checkHasCompleted.mockReset();
  jest.spyOn(actionHook, 'useActions').mockReturnValue({
    completeAction,
    checkHasCompleted,
    isActionsFetched: true,
    actions: [],
  });

  // need to reset the query cache
  queryClient.clear();
});

it('should not render if user is not logged in', async () => {
  renderComponent({ user: null, alerts: defaultAlerts });
  const popup = screen.queryByLabelText('Recover your streak');
  expect(popup).not.toBeInTheDocument();
});

it('should not render if not logged && "recoverStreak" is true from boot', async () => {
  renderComponent({ user: null });
  await waitForNock();

  await waitFor(() => {
    const popup = screen.queryByLabelText('Restore my streak');
    expect(popup).not.toBeInTheDocument();
  });
});

it('should never render if user disabled this popup', async () => {
  checkHasCompleted.mockReturnValue(true);
  renderComponent({});
  await waitForNock();
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).not.toBeInTheDocument();
});

it('should render and fetch initial data if logged user can recover streak', async () => {
  let haveFetched = false;

  mockRecoveryQuery(
    {
      canRecover: true,
      cost: 25,
      oldStreakLength: 10,
    },
    () => {
      haveFetched = true;
    },
  );

  renderComponent({});

  await waitForNock();

  // fetched
  expect(haveFetched).toBeTruthy();

  // and rendered
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).toBeInTheDocument();
});

it('Should have no cost for first time recovery', async () => {
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 0,
    oldStreakLength: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = screen.queryByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect cost to be 0
  const cost = screen.getByText('0 Rep');
  expect(cost).toBeInTheDocument();
});

it('Should have cost of 25 points for 2nd+ time recovery', async () => {
  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = screen.queryByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect cost to be 25
  const cost = screen.getByText('25 Rep');
  expect(cost).toBeInTheDocument();
});

it('Should show not enough points message if user does not have enough points', async () => {
  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 10,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 10,
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = screen.queryByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect not enough points message
  const button = screen.queryByTestId('streak-recover-button');
  expect(button).not.toBeInTheDocument();

  const copy = screen.queryByTestId('streak-recovery-copy');
  expect(copy).toHaveTextContent('You don’t have enough');
});

it('Should show success message on recover', async () => {
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 102,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = screen.queryByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // button is there
  const button = screen.getByTestId('streak-recover-button');
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  let mutationCalled = false;
  mockRecoveryMutation({}, () => {
    mutationCalled = true;
  });

  mockAlertsMutation();
  await waitForNock();

  // expect mutation to be called
  expect(mutationCalled).toBeTruthy();

  // expect success message
  const alert = await screen.findByRole('alert');
  expect(alert).toContainHTML('Lucky you! Your streak has been restored');
});

it('Should show error message on recover fail', async () => {
  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 102,
  });

  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = screen.queryByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // button is there
  const button = screen.getByTestId('streak-recover-button');
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  mockGraphQL({
    request: {
      query: USER_STREAK_RECOVER_MUTATION,
    },
    result: {
      errors: [{ message: 'error' }],
    },
  });

  mockAlertsMutation();
  await waitForNock();

  // expect error message
  const alert = await screen.findByRole('alert');
  expect(alert).toContainHTML(
    'Oops! We are unable to recover your streak. Could you try again later?',
  );
});

it('Should dismiss popup on close if checked option', async () => {
  window.scrollTo = jest.fn();

  renderComponent({});
  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 10,
  });

  await waitForNock();

  // popup is rendered
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).toBeInTheDocument();

  // check the checkbox
  const checkbox = screen.getByLabelText('Never show this again');
  fireEvent.click(checkbox);

  // close the popup
  const closeButton = await screen.findByTitle('Close streak recover popup');
  fireEvent.click(closeButton);

  mockAlertsMutation();
  await waitForNock();

  // expect popup to be dismissed
  await waitFor(() => {
    const closedPopup = screen.queryByTestId('streak-recover-modal-heading');
    expect(closedPopup).not.toBeInTheDocument();
  });

  await waitForNock();

  // expect action to be completed
  expect(completeAction).toHaveBeenCalledWith(
    ActionType.DisableReadingStreakRecover,
  );
});

it('should update alerts preferences on close', async () => {
  window.scrollTo = jest.fn();

  renderComponent({});
  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 10,
  });

  await waitForNock();

  // popup is rendered
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).toBeInTheDocument();

  const closeButton = screen.getByTitle('Close streak recover popup');
  fireEvent.click(closeButton);

  mockAlertsMutation();

  await waitForNock();

  expect(updateAlerts).toHaveBeenCalled();
});
