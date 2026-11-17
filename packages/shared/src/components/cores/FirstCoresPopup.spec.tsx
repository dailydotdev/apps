import React from 'react';
import nock from 'nock';
import { render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { CoresRole } from '../../lib/user';
import type { UserTransaction } from '../../graphql/njord';
import { TRANSACTIONS_QUERY, UserTransactionStatus } from '../../graphql/njord';
import * as actionHook from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { MODAL_KEY } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { FirstCoresPopup } from './FirstCoresPopup';

const completeAction = jest.fn();

const user: LoggedUser = {
  ...defaultUser,
  coresRole: CoresRole.User,
  balance: { amount: 0 },
};

const me = {
  id: user.id,
  name: user.name,
  username: user.username,
  image: user.image,
  permalink: user.permalink,
  createdAt: '2023-01-01T00:00:00.000Z',
  reputation: 10,
};

const system = { ...me, id: 'system', username: 'system' };

const questReward: UserTransaction = {
  id: 't-quest',
  status: UserTransactionStatus.Success,
  flags: { note: 'Quest reward' },
  balance: { amount: 20 },
  createdAt: new Date(),
  sender: system,
  receiver: me,
  value: 20,
  valueIncFees: 20,
};

const purchase: UserTransaction = {
  ...questReward,
  id: 't-purchase',
  sender: undefined,
  flags: {},
};

const renderPopup = (transaction: UserTransaction) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  mockGraphQL({
    request: { query: TRANSACTIONS_QUERY, variables: { first: 2 } },
    result: {
      data: {
        transactions: {
          pageInfo: { endCursor: 'cursor', hasNextPage: false },
          edges: [{ node: transaction }],
        },
      },
    },
  });

  const view = render(
    <TestBootProvider client={client} auth={{ user }}>
      <FirstCoresPopup />
    </TestBootProvider>,
  );

  // The claim lands: the empty balance gets its first Cores
  view.rerender(
    <TestBootProvider
      client={client}
      auth={{ user: { ...user, balance: { amount: 20 } } }}
    >
      <FirstCoresPopup />
    </TestBootProvider>,
  );

  return client;
};

beforeEach(() => {
  nock.cleanAll();
  completeAction.mockReset();
  jest.spyOn(actionHook, 'useActions').mockReturnValue({
    completeAction,
    checkHasCompleted: () => false,
    isActionsFetched: true,
    actions: [],
  });
});

it('should open once when an empty balance earns its first Cores', async () => {
  const client = renderPopup(questReward);

  await waitFor(() =>
    expect(client.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.FirstCores,
      props: { amount: 20 },
    }),
  );
  expect(completeAction).toHaveBeenCalledWith(ActionType.FirstCores);
});

it('should not open when the first Cores were bought', async () => {
  const client = renderPopup(purchase);

  await waitFor(() => expect(nock.isDone()).toBe(true));
  expect(client.getQueryData(MODAL_KEY)).toBeUndefined();
  expect(completeAction).not.toHaveBeenCalled();
});
