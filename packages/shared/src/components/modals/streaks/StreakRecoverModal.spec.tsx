import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
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
import * as toastHook from '../../../hooks/useToastNotification';
import * as streakHook from '../../../hooks/streaks/useReadingStreak';
import { ActionType } from '../../../graphql/actions';
import Toast from '../../notifications/Toast';
import { DayOfWeek } from '../../../lib/date';

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
  showStreakMilestone: true,
};

const checkHasCompleted = jest.fn();
const completeAction = jest.fn();
const updateAlerts = jest.fn();
const displayToast = jest.fn();

const queryClient = new QueryClient({});

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

const renderComponent = (props: TestProps = {}) => {
  const {
    user = { ...loggedUser, reputation: 10 },
    alerts = alertsWithStreakRecovery,
  } = props;

  return render(
    <TestBootProvider
      client={queryClient}
      auth={{ user }}
      alerts={{ alerts, updateAlerts }}
      settings={{
        loadedSettings: true,
        optOutReadingStreak: false,
      }}
    >
      <BootPopups />
      <Toast autoDismissNotifications={false} />
    </TestBootProvider>,
  );
};

beforeEach(async () => {
  jest.spyOn(actionHook, 'useActions').mockReturnValue({
    completeAction,
    checkHasCompleted,
    isActionsFetched: true,
    actions: [],
  });
  jest.spyOn(toastHook, 'useToastNotification').mockReturnValue({
    displayToast,
    dismissToast: jest.fn(),
    subject: undefined,
  });

  jest.spyOn(streakHook, 'useReadingStreak').mockReturnValue({
    isLoading: false,
    isStreaksEnabled: true,
    streak: {
      current: 10,
      max: 10,
      total: 12,
      weekStart: DayOfWeek.Monday,
      lastViewAt: subDays(new Date(), 2),
    },
    updateStreakConfig: jest.fn(),
    checkReadingStreak: jest.fn(),
    shouldShowPopup: false,
  });

  // need to reset the query cache
  queryClient.clear();
  // need to reset the mock
  checkHasCompleted.mockReset();
  completeAction.mockReset();
  updateAlerts.mockReset();
  displayToast.mockReset();
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

  renderComponent();

  await waitForNock();

  // fetched
  expect(haveFetched).toBeTruthy();

  // and rendered
  const popup = screen.queryByTestId('streak-recover-modal-heading');
  expect(popup).toBeInTheDocument();
});

it('should update alerts preferences on close', async () => {
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 25,
    oldStreakLength: 10,
  });
  renderComponent({});

  await waitForNock();

  // popup is rendered
  await screen.findByTestId('streak-recover-modal-heading');

  mockAlertsMutation();

  // trigger close
  const closeButton = await screen.findByTitle('Close streak recover popup');
  fireEvent.click(closeButton);
  await waitForNock();

  expect(updateAlerts).toHaveBeenCalled();
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
  const button = await screen.findByTestId('streak-recover-button');
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  let mutationCalled = false;
  mockRecoveryMutation({}, () => {
    mutationCalled = true;
  });
  mockAlertsMutation();
  await waitForNock();

  // expect mutation to be called
  await waitFor(() => expect(mutationCalled).toBeTruthy());

  // expect success message
  await waitForNock();
  expect(displayToast).toHaveBeenCalledWith(
    'Lucky you! Your streak has been restored',
  );
});

it('Should dismiss popup on close if checked option', async () => {
  // window.scrollTo = jest.fn();

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
  await screen.findByTestId('streak-recover-modal-heading');

  // check never show again
  fireEvent.click(await screen.findByTestId('streak-recover-optout'));

  mockAlertsMutation();

  // close the popup
  const closeButton = await screen.findByTitle('Close streak recover popup');
  fireEvent.click(closeButton);
  await waitForNock();

  // expect action to be completed
  expect(completeAction).toHaveBeenCalledWith(
    ActionType.DisableReadingStreakRecover,
  );
});

it('Should show error message on recover fail', async () => {
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
  await screen.findByTestId('streak-recover-modal-heading');

  mockGraphQL({
    request: {
      query: USER_STREAK_RECOVER_MUTATION,
    },
    result: {
      errors: [{ message: 'error' }],
    },
  });

  mockAlertsMutation();

  // button is there
  const button = await screen.findByTestId('streak-recover-button');
  fireEvent.click(button);
  await waitForNock();

  // expect error message
  expect(displayToast).toHaveBeenCalledWith(
    'Oops! We are unable to recover your streak. Could you try again later?',
  );
});
