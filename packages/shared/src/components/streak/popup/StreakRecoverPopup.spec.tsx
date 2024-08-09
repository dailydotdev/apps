import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { StreakRecoverPopup } from './StreakRecoverPopup';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { Alerts } from '../../../graphql/alerts';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { UPDATE_USER_SETTINGS_MUTATION } from '../../../graphql/settings';

interface TestProps {
  user?: LoggedUser | null;
  alerts?: Alerts;
}

const defaultAlerts: Alerts = {
  filter: true,
  rankLastSeen: null,
};

const alertsWithStreakRecovery: Alerts = {
  ...defaultAlerts,
  streakRecovery: true,
};

const renderComponent = (props: TestProps) => {
  const {
    user = { ...loggedUser, reputation: 10 },
    alerts = alertsWithStreakRecovery,
  } = props;
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client} auth={{ user }} alerts={{ alerts }}>
      <StreakRecoverPopup {...props} />
    </TestBootProvider>,
  );
};

const mockRecoveryQuery = (data) => {
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_SETTINGS_MUTATION, // todo: update this
      variables: {},
    },
    result: () => {
      mutationCalled = true;
      return {
        data,
      };
    },
  });

  return { mutationCalled };
};

it('should not render if user is not logged in', async () => {
  renderComponent({ user: null, alerts: defaultAlerts });
  const popup = screen.queryByLabelText('Recover your streak');
  expect(popup).not.toBeInTheDocument();
});

it('should not render if not logged && "recoverStreak" is true from boot', async () => {
  renderComponent({ user: null });
  const popup = screen.queryByLabelText('Restore my streak');
  expect(popup).toBeInTheDocument();
});

it('should render if loggedIn && "recoverStreak" is true from boot', async () => {
  renderComponent({});
  const popup = screen.queryByLabelText('Restore my streak');
  expect(popup).toBeInTheDocument();
});

it('should fetch recover streak infos on mount', async () => {
  renderComponent({});

  const { mutationCalled } = mockRecoveryQuery({});

  // expect mutation to be called
  expect(mutationCalled).toBe(true);
});

it('Should have no cost for first time recovery', async () => {
  renderComponent({
    user: {
      ...loggedUser,
      reputation: 10,
    },
  });

  mockRecoveryQuery({
    recovery: {
      canDo: true,
      amount: 0,
    },
  });

  // expect cost to be 0
  const cost = await screen.findByLabelText('0 Rep');
  expect(cost).toBeInTheDocument();
});

it('Should have cost of 25 points for 2nd+ time recovery', async () => {
  renderComponent({
    user: {
      ...loggedUser,
      reputation: 50,
    },
  });

  mockRecoveryQuery({
    recovery: {
      canDo: true,
      amount: 25,
    },
  });

  // expect cost to be 25
  const cost = await screen.findByLabelText('25 Rep');
  expect(cost).toBeInTheDocument();
});

it('Should show not enough points message if user does not have enough points', async () => {
  renderComponent({
    user: {
      ...loggedUser,
      reputation: 0,
    },
  });

  mockRecoveryQuery({
    recovery: {
      canDo: false,
      amount: 25,
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
