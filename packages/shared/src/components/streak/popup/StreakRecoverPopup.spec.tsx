import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { StreakRecoverPopup } from './StreakRecoverPopup';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';

const renderComponent = (props: { user?: LoggedUser | null }) => {
  const { user = loggedUser } = props;
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <StreakRecoverPopup {...props} />
    </TestBootProvider>,
  );
};

it('should render', async () => {
  const { container } = renderComponent({});
  expect(container).toMatchSnapshot();
});

it('should not render if user is not logged in', async () => {
  renderComponent({ user: null });
  const popup = screen.queryByLabelText('Recover your streak');
  expect(popup).not.toBeInTheDocument();
});

it('should not render if user has no streak', async () => {});

it('should render if "recoverStreak" true from boot', async () => {});

it('should fetch recover streak infos on mount', async () => {});

it('Should have no cost for first time recovery', async () => {});

it('Should have cost for 2nd+ time recovery', async () => {});

it('Should show not enough points message if user does not have enough points', async () => {});

it('Should update streak on recover', async () => {});

it('Should show success message on recover', async () => {
  renderComponent({});
  // click recover
  // expect success message
  const successMessage = await screen.findByLabelText(
    'Lucky you! Your streak has been restored',
  );
  expect(successMessage).toBeInTheDocument();
});

it('Should show error message on recover fail', async () => {
  renderComponent({});
  // click recover
  // expect error message
  const errorMessage = await screen.findByLabelText(
    'Oops! Something went wrong. Please try again',
  );
  expect(errorMessage).toBeInTheDocument();
});

it('Should dismiss popup on close if checked option', async () => {
  const action = 'hide_streak_recovery';
});
