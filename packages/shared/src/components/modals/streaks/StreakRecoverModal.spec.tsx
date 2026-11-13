import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { subDays } from 'date-fns';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Alerts } from '../../../graphql/alerts';
import { UPDATE_ALERTS } from '../../../graphql/alerts';
import { BootPopups } from '../BootPopups';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import type { UserStreakRecoverData } from '../../../graphql/users';
import {
  USER_STREAK_RECOVER_MUTATION,
  USER_STREAK_RECOVER_QUERY,
} from '../../../graphql/users';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import * as actionHook from '../../../hooks/useActions';
import * as toastHook from '../../../hooks/useToastNotification';
import * as streakHook from '../../../hooks/streaks/useReadingStreak';
import { ActionType } from '../../../graphql/actions';
import Toast from '../../notifications/Toast';
import { DayOfWeek } from '../../../lib/date';
import { LogEvent, TargetType } from '../../../lib/log';

interface TestProps {
  user?: LoggedUser;
  alerts?: Alerts;
  gb?: GrowthBook;
}

const logEvent = jest.fn();

const defaultAlerts: Alerts = {
  filter: true,
  rankLastSeen: undefined,
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
    user = { ...loggedUser, balance: { amount: 0 } },
    alerts = alertsWithStreakRecovery,
    gb,
  } = props;

  return render(
    <TestBootProvider
      client={queryClient}
      gb={gb}
      auth={{ user }}
      alerts={{ alerts, updateAlerts }}
      log={{ logEvent }}
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
    isUpdatingConfig: false,
    streak: {
      current: 10,
      max: 10,
      total: 12,
      weekStart: DayOfWeek.Monday,
      lastViewAt: subDays(new Date(), 2),
      freezesAvailable: 0,
    },
    updateStreakConfig: jest.fn(),
    checkReadingStreak: jest.fn(),
  });

  // need to reset the query cache
  queryClient.clear();
  // need to reset the mock
  checkHasCompleted.mockReset();
  completeAction.mockReset();
  updateAlerts.mockReset();
  displayToast.mockReset();
  logEvent.mockReset();
});

const mockBrokenStreak = () =>
  jest.spyOn(streakHook, 'useReadingStreak').mockReturnValue({
    isLoading: false,
    isStreaksEnabled: true,
    isUpdatingConfig: false,
    streak: {
      current: 0,
      max: 40,
      total: 52,
      weekStart: DayOfWeek.Monday,
      lastViewAt: subDays(new Date(), 2),
      freezesAvailable: 0,
    },
    updateStreakConfig: jest.fn(),
    checkReadingStreak: jest.fn(),
  });

const softBreakOn = () =>
  new GrowthBook({
    features: { streak_soft_break: { defaultValue: true } },
  });

it('should not render if user is not logged in', async () => {
  renderComponent({ user: undefined, alerts: defaultAlerts });
  const popup = screen.queryByLabelText('Recover your streak');
  expect(popup).not.toBeInTheDocument();
});

it('should not render if not logged && "recoverStreak" is true from boot', async () => {
  renderComponent({ user: undefined });
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
      cost: 100,
      oldStreakLength: 10,
      regularCost: 100,
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
  const popup = await screen.findByTestId('streak-recover-modal-heading');
  // Production markup, double space included.
  expect(popup).toHaveTextContent(
    /^Oh no! Your 10 day streak {2}has been broken!$/,
    { normalizeWhitespace: false },
  );
  expect(screen.queryByText('Start again')).not.toBeInTheDocument();
});

it('should update alerts preferences on close', async () => {
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 10,
    regularCost: 100,
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
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 50,
      },
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = await screen.findByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect cost to be 0
  const cost = screen.getByText('Restore my streakFree');
  expect(cost).toBeInTheDocument();
});

it('Should have cost of 100 Cores for 2nd+ time recovery', async () => {
  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 10,
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 200,
      },
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = await screen.findByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect cost to be 100
  const cost = screen.getByText('Restore my streak100');
  expect(cost).toBeInTheDocument();
});

it('leads with the longest streak and offers a way back when the soft break is on', async () => {
  mockBrokenStreak();
  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 10,
    regularCost: 100,
  });

  renderComponent({
    user: { ...loggedUser, balance: { amount: 200 } },
    gb: softBreakOn(),
  });

  await waitForNock();

  const heading = await screen.findByTestId('streak-recover-modal-heading');
  expect(heading).toHaveTextContent('Your best: 40 days. Today can be day 1.');
  expect(screen.getByTestId('streak-recover-button')).toHaveTextContent(
    'Restore my streak100',
  );
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreakSoftBreak,
    target_id: 'restore modal',
  });

  fireEvent.click(screen.getByTestId('streak-recover-optout'));
  mockAlertsMutation();
  fireEvent.click(screen.getByRole('button', { name: 'Start again' }));
  await waitForNock();

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.StreakSoftBreak,
    target_id: 'restore modal',
  });
  expect(completeAction).toHaveBeenCalledWith(
    ActionType.DisableReadingStreakRecover,
  );
  // The permanent opt-out is logged whichever button closed the modal.
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.DismissStreakRecover,
  });
  expect(updateAlerts).toHaveBeenCalledWith(
    expect.objectContaining({ showRecoverStreak: false }),
  );
});

it('Should show buy Cores message if user does not have enough Cores', async () => {
  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 10,
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 50,
      },
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = await screen.findByTestId('streak-recover-modal-heading');
  expect(popupHeader).toBeInTheDocument();

  // expect not enough Cores message
  const button = screen.queryByTestId('streak-recover-button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Buy Cores100');

  const copy = screen.queryByTestId('streak-recovery-copy');
  expect(copy).toHaveTextContent("You don't have enough");
});

it('Should show success message on recover', async () => {
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 102,
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 100,
      },
    },
  });

  await waitForNock();

  // rendered
  const popupHeader = await screen.findByTestId('streak-recover-modal-heading');
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
  window.scrollTo = jest.fn();

  mockRecoveryQuery({
    canRecover: true,
    cost: 100,
    oldStreakLength: 102,
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 100,
      },
    },
  });

  await waitForNock();

  // rendered
  await screen.findByTestId('streak-recover-modal-heading');

  // check never show again
  const neverShowAgain = await screen.findByTestId<HTMLInputElement>(
    'streak-recover-optout',
  );
  fireEvent.click(neverShowAgain);
  expect(neverShowAgain).toBeChecked();

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
    cost: 100,
    oldStreakLength: 102,
    regularCost: 100,
  });

  renderComponent({
    user: {
      ...loggedUser,
      balance: {
        amount: 100,
      },
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
