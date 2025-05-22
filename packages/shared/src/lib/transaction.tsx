import React from 'react';
import type { ReactNode } from 'react';
import type { UserTransaction } from '../graphql/njord';
import { UserTransactionStatus } from '../graphql/njord';
import type { LoggedUser } from './user';
import { Image } from '../components/image/Image';

export type TransactionItemType = 'receive' | 'send' | 'purchase' | 'unknown';

export const getTransactionType = ({
  transaction,
  user,
}: {
  transaction: UserTransaction;
  user: LoggedUser;
}): TransactionItemType => {
  if (!transaction.sender && !transaction.product) {
    return 'purchase';
  }

  if (transaction.receiver.id === user.id) {
    return 'receive';
  }

  if (transaction.sender.id === user.id) {
    return 'send';
  }

  return 'unknown';
};

export const getTransactionLabel = ({
  transaction,
  user,
}: {
  transaction: UserTransaction;
  user: LoggedUser;
}): ReactNode => {
  const type = getTransactionType({ transaction, user });

  if (transaction.flags.error) {
    return (
      <span className="text-accent-ketchup-default">
        {transaction.flags.error || 'Failed'}
      </span>
    );
  }

  if (UserTransactionStatus.Created === transaction.status) {
    return 'Created';
  }

  if (UserTransactionStatus.Processing === transaction.status) {
    return 'Pending';
  }

  if (type === 'purchase') {
    return 'Purchased';
  }

  if (['receive', 'send'].includes(type)) {
    if (transaction.product) {
      return (
        <div className="flex items-center gap-1">
          <Image
            src={transaction.product.image}
            alt={transaction.product.name}
            className="size-5"
          />
          Award{' '}
        </div>
      );
    }

    if (['Streak restore'].includes(transaction.flags.note)) {
      return transaction.flags.note;
    }
  }

  return type.toUpperCase();
};

export const minCoresEarningsThreshold = 100_000;

export const coreApproxValueUSD = 100;
