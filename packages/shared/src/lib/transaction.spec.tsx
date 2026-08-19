import type { UserTransaction } from '../graphql/njord';
import { ProductType, UserTransactionType } from '../graphql/njord';
import { getTransactionLabel, getTransactionNote } from './transaction';
import loggedUser, { author } from '../../__tests__/fixture/loggedUser';

const baseTransaction: UserTransaction = {
  id: 't1',
  status: 0,
  receiver: author,
  sender: { ...author, id: 'u2' },
  value: 100,
  valueIncFees: 100,
  flags: {},
  balance: { amount: 0 },
  createdAt: new Date(),
  product: {
    id: 'p1',
    name: 'Award',
    image: 'https://daily.dev/award.jpg',
    type: ProductType.Award,
    value: 100,
  },
};

describe('getTransactionNote', () => {
  it('returns the note for a user award', () => {
    expect(
      getTransactionNote({
        transaction: {
          ...baseTransaction,
          referenceType: UserTransactionType.User,
          flags: { note: 'Thanks for the help!' },
        },
      }),
    ).toEqual('Thanks for the help!');
  });

  it('returns undefined for a user award without a note', () => {
    expect(
      getTransactionNote({
        transaction: {
          ...baseTransaction,
          referenceType: UserTransactionType.User,
        },
      }),
    ).toBeUndefined();
  });

  it('ignores the system note on a post boost', () => {
    expect(
      getTransactionNote({
        transaction: {
          ...baseTransaction,
          referenceType: UserTransactionType.PostBoost,
          flags: { note: 'Boosting my post' },
        },
      }),
    ).toBeUndefined();
  });

  it('ignores the system note on a streak restore', () => {
    expect(
      getTransactionNote({
        transaction: { ...baseTransaction, flags: { note: 'Streak restore' } },
      }),
    ).toBeUndefined();
  });
});

describe('getTransactionLabel', () => {
  const getLabel = (transaction: UserTransaction) =>
    getTransactionLabel({ transaction, user: loggedUser });

  it('keeps the system note as the label for a post boost', () => {
    expect(
      getLabel({
        ...baseTransaction,
        referenceType: UserTransactionType.PostBoost,
        flags: { note: 'Boosting my post' },
      }),
    ).toEqual('Boosting my post');
  });

  it('keeps the system note as the label for a quest reward', () => {
    expect(
      getLabel({
        ...baseTransaction,
        referenceType: 'quest_reward:streak' as UserTransactionType,
        flags: { note: 'Streak quest completed' },
      }),
    ).toEqual('Streak quest completed');
  });

  it('keeps the streak restore label', () => {
    expect(
      getLabel({
        ...baseTransaction,
        product: undefined,
        flags: { note: 'Streak restore' },
      }),
    ).toEqual('Streak restore');
  });

  it('does not use the note as the label for a user award', () => {
    expect(
      getLabel({
        ...baseTransaction,
        referenceType: UserTransactionType.User,
        flags: { note: 'Thanks for the help!' },
      }),
    ).not.toEqual('Thanks for the help!');
  });
});
