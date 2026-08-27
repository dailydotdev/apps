import React from 'react';
import { render, screen, within } from '@testing-library/react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import {
  ProductType,
  TRANSACTION_SUMMARY_QUERY,
  TRANSACTIONS_QUERY,
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import type {
  LoggedUser,
  UserShortProfile,
} from '@dailydotdev/shared/src/lib/user';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import WalletPage from '../pages/wallet';

const walletUser: LoggedUser = {
  ...defaultUser,
  coresRole: CoresRole.User,
  balance: { amount: 1000 },
};

const toShortProfile = (
  user: Pick<
    UserShortProfile,
    'id' | 'name' | 'username' | 'image' | 'permalink'
  >,
): UserShortProfile => ({
  ...user,
  createdAt: '2023-01-01T00:00:00.000Z',
  reputation: 10,
});

const me = toShortProfile(walletUser);

const gifter = toShortProfile({
  id: 'gifter',
  name: 'Gifty McGift',
  username: 'gifty',
  image: 'https://daily.dev/gifty.png',
  permalink: 'https://app.daily.dev/gifty',
});

const recipient = toShortProfile({
  id: 'recipient',
  name: 'Recipient Rita',
  username: 'rita',
  image: 'https://daily.dev/rita.png',
  permalink: 'https://app.daily.dev/rita',
});

const system = toShortProfile({
  id: 'system',
  name: 'daily.dev',
  username: 'system',
  image: 'https://daily.dev/system.png',
  permalink: 'https://app.daily.dev/system',
});

const award = {
  id: 'award-1',
  type: ProductType.Award,
  name: 'Medal',
  image: 'https://daily.dev/medal.png',
  value: 42,
};

const createdAt = new Date('2024-03-05T10:20:00.000Z');

const baseTransaction = {
  status: UserTransactionStatus.Success,
  flags: {},
  balance: { amount: 1000 },
  createdAt,
};

const receivedAward: UserTransaction = {
  ...baseTransaction,
  id: 't-received',
  product: award,
  sender: gifter,
  receiver: me,
  value: 42,
  valueIncFees: 42,
  sourceName: 'Web',
};

const sentAward: UserTransaction = {
  ...baseTransaction,
  id: 't-sent',
  product: award,
  sender: me,
  receiver: recipient,
  value: 20,
  valueIncFees: 20,
};

const boost: UserTransaction = {
  ...baseTransaction,
  id: 't-boost',
  sender: system,
  receiver: me,
  value: 100,
  valueIncFees: 100,
  flags: { note: 'Post boost refund' },
  referenceType: UserTransactionType.PostBoost,
};

const purchase: UserTransaction = {
  ...baseTransaction,
  id: 't-purchase',
  receiver: me,
  value: 500,
  valueIncFees: 500,
};

const freeAward: UserTransaction = {
  ...baseTransaction,
  id: 't-free',
  product: { ...award, value: 0 },
  sender: gifter,
  receiver: me,
  value: 0,
  valueIncFees: 0,
};

const allTransactions = [receivedAward, sentAward, boost, purchase, freeAward];

const getWalletRows = async (): Promise<HTMLElement[]> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  mockGraphQL({
    request: { query: TRANSACTION_SUMMARY_QUERY },
    result: {
      data: { transactionSummary: { purchased: 1, received: 2, spent: 3 } },
    },
  });
  mockGraphQL({
    request: { query: TRANSACTIONS_QUERY, variables: { first: 20, after: '' } },
    result: {
      data: {
        transactions: {
          pageInfo: { endCursor: 'cursor', hasNextPage: false },
          edges: allTransactions.map((node) => ({ node })),
        },
      },
    },
  });

  render(
    <TestBootProvider client={client} auth={{ user: walletUser }}>
      <WalletPage />
    </TestBootProvider>,
  );

  return screen.findAllByRole('listitem');
};

const getRowLinks = (row: HTMLElement): HTMLAnchorElement[] =>
  within(row).getAllByRole('link') as HTMLAnchorElement[];

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        isReady: true,
        pathname: '/wallet',
        asPath: '/wallet',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
      } as unknown as NextRouter),
  );
});

describe('wallet transaction history', () => {
  it('links a received award to the sender profile', async () => {
    const [row] = await getWalletRows();
    const links = getRowLinks(row);

    expect(links).toHaveLength(2);
    links.forEach((link) =>
      expect(link).toHaveAttribute('href', gifter.permalink),
    );
    expect(within(links[1]).getByText(gifter.name)).toBeInTheDocument();
  });

  it('links a sent award to the receiver profile', async () => {
    const rows = await getWalletRows();
    const links = getRowLinks(rows[1]);

    links.forEach((link) =>
      expect(link).toHaveAttribute('href', recipient.permalink),
    );
    expect(within(links[1]).getByText(recipient.name)).toBeInTheDocument();
  });

  it('links a boost row to the system profile', async () => {
    const rows = await getWalletRows();
    const links = getRowLinks(rows[2]);

    links.forEach((link) =>
      expect(link).toHaveAttribute('href', system.permalink),
    );
    expect(within(links[1]).getByText(system.name)).toBeInTheDocument();
  });

  it('links a purchase row to your own profile', async () => {
    const rows = await getWalletRows();
    const links = getRowLinks(rows[3]);

    links.forEach((link) => expect(link).toHaveAttribute('href', me.permalink));
    expect(within(links[1]).getByText(me.name)).toBeInTheDocument();
  });

  it('keeps amounts, labels and dates outside of the profile link', async () => {
    const rows = await getWalletRows();

    expect(within(rows[0]).getByText('+42')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Award')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Web Squad')).toBeInTheDocument();
    expect(within(rows[1]).getByText('-20')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Post boost refund')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Purchased')).toBeInTheDocument();
    expect(within(rows[4]).getByText('Free')).toBeInTheDocument();

    rows.forEach((row) => {
      expect(
        within(row).getByText(/Mar 05, 2024 \d{2}:\d{2}/),
      ).toBeInTheDocument();

      getRowLinks(row).forEach((link) => {
        expect(
          within(link).queryByText(/Mar 05, 2024/),
        ).not.toBeInTheDocument();
      });
    });
  });
});
