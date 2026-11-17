import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../../hooks/useActions';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { ActionType } from '../../graphql/actions';
import { getTransactions } from '../../graphql/njord';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getTransactionType } from '../../lib/transaction';
import { LazyModal } from '../modals/common/types';

/**
 * Opens "You earned your first Cores" once, when an empty balance gets its
 * first Cores and the only transaction so far is that reward. A purchase
 * gets its own "You got your Cores!" instead.
 */
export const FirstCoresPopup = (): ReactElement | null => {
  const { user } = useAuthContext();
  const hasCoresAccess = useHasAccessToCores();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { openModal, modal } = useLazyModal();
  const balance = user?.balance?.amount;
  const previousBalance = useRef(balance);
  const [earned, setEarned] = useState<number>();

  useEffect(() => {
    const previous = previousBalance.current;
    previousBalance.current = balance;

    if (previous === 0 && !!balance && balance > 0) {
      setEarned(balance);
    }
  }, [balance]);

  const isEligible =
    !!earned &&
    hasCoresAccess &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.FirstCores);

  const { data: transactions } = useQuery({
    queryKey: generateQueryKey(RequestKey.Transactions, user, 'list', {
      first: 2,
    }),
    queryFn: () => getTransactions({ first: 2 }),
    enabled: isEligible,
  });

  useEffect(() => {
    if (!isEligible || !transactions || !user || modal) {
      return;
    }

    setEarned(undefined);
    const [first, ...rest] = transactions.edges;

    if (
      !first ||
      rest.length ||
      getTransactionType({ transaction: first.node, user }) === 'purchase'
    ) {
      return;
    }

    completeAction(ActionType.FirstCores);
    openModal({ type: LazyModal.FirstCores, props: { amount: earned } });
  }, [
    completeAction,
    earned,
    isEligible,
    modal,
    openModal,
    transactions,
    user,
  ]);

  return null;
};
