import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { CoresRole } from '../../lib/user';
import * as actionHook from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { StartupsPromoSpot } from '../../features/squads/hooks/useStartupsPromo';
import { CoresDeals } from './CoresDeals';

const completeAction = jest.fn();
let completed: ActionType[] = [];

const user: LoggedUser = {
  ...defaultUser,
  isPlus: false,
  coresRole: CoresRole.User,
};

const renderDeals = (isDismissible?: boolean) =>
  render(
    <TestBootProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      auth={{ user }}
    >
      <CoresDeals
        spot={StartupsPromoSpot.Wallet}
        isDismissible={isDismissible}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  completed = [];
  jest.spyOn(actionHook, 'useActions').mockImplementation(() => ({
    completeAction,
    checkHasCompleted: (type: ActionType) => completed.includes(type),
    isActionsFetched: true,
    actions: [],
  }));
});

describe('CoresDeals', () => {
  it('has no close button where Cores are being bought', () => {
    renderDeals();

    expect(screen.getByText('Plus')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: "Don't show this offer again" }),
    ).not.toBeInTheDocument();
  });

  it('lets the wallet close the Plus deal for good', () => {
    renderDeals(true);

    fireEvent.click(
      screen.getByRole('button', { name: "Don't show this offer again" }),
    );

    expect(completeAction).toHaveBeenCalledWith(ActionType.DismissPlusDeal);
  });

  it('keeps a closed Plus deal off the wallet', () => {
    completed = [ActionType.DismissPlusDeal];
    renderDeals(true);

    expect(screen.queryByText('Plus')).not.toBeInTheDocument();
  });

  it('still shows a closed Plus deal when buying Cores', () => {
    completed = [ActionType.DismissPlusDeal];
    renderDeals();

    expect(screen.getByText('Plus')).toBeInTheDocument();
  });
});
