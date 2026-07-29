import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useTransactionError } from '../useTransactionError';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent, Origin } from '../../lib/log';
import { getPathnameWithQuery } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import { isExtension } from '../../lib/func';
import { useReadingStreak } from './useReadingStreak';
import type { StreakFreezeProduct } from '../../graphql/streakFreeze';
import {
  purchaseStreakFreeze,
  STREAK_FREEZE_CAP,
  streakFreezeProductsQueryOptions,
  userStreakFreezeDatesQueryOptions,
} from '../../graphql/streakFreeze';

export interface UseStreakFreezeReturn {
  freezesAvailable: number;
  products: StreakFreezeProduct[];
  isLoadingProducts: boolean;
  freezeDates: string[];
  isPurchasing: boolean;
  canBuyProduct: (product: StreakFreezeProduct) => boolean;
  onPurchase: (product: StreakFreezeProduct) => Promise<void>;
}

export { STREAK_FREEZE_CAP };

interface UseStreakFreezeProps {
  // Skip the products/freeze-dates network calls when the caller hasn't
  // confirmed the feature flag + cores access gates yet (e.g. a popover row
  // that renders regardless of the feature being enabled for this user).
  enabled?: boolean;
}

export const useStreakFreeze = ({
  enabled = true,
}: UseStreakFreezeProps = {}): UseStreakFreezeReturn => {
  const { user, updateUser } = useAuthContext();
  const { streak } = useReadingStreak();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const onTransactionError = useTransactionError();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: products, isPending: isLoadingProducts } = useQuery({
    ...streakFreezeProductsQueryOptions(),
    enabled,
  });

  const { data: freezeDates } = useQuery({
    ...userStreakFreezeDatesQueryOptions({ user }),
    enabled: enabled && !!user?.id,
  });

  const purchaseMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.StreakFreezePurchase, user),
    mutationFn: (productId: string) => purchaseStreakFreeze(productId),
    onSuccess: (data) => {
      logEvent({ event_name: LogEvent.PurchaseStreakFreeze });

      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.UserStreak, user),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      if (data.balance && user) {
        updateUser({ ...user, balance: data.balance });
      }

      displayToast('Nice! Your streak freezes have been added.');
    },
    onError: onTransactionError,
  });

  const freezesAvailable = streak?.freezesAvailable ?? 0;

  const canBuyProduct = useCallback(
    (product: StreakFreezeProduct) =>
      freezesAvailable + product.flags.quantity <= STREAK_FREEZE_CAP,
    [freezesAvailable],
  );

  const onPurchase = useCallback(
    async (product: StreakFreezeProduct) => {
      if (!user) {
        return;
      }

      logEvent({
        event_name: LogEvent.ClickStreakFreezePurchase,
        target_id: product.id,
        extra: JSON.stringify({ quantity: product.flags.quantity }),
      });

      if (user.balance.amount < product.value) {
        const searchParams = new URLSearchParams();
        searchParams.set('origin', Origin.StreakFreeze);

        if (!isExtension) {
          searchParams.set('next', router.pathname);
        }

        router?.push(getPathnameWithQuery(`${webappUrl}cores`, searchParams));

        return;
      }

      await purchaseMutation.mutateAsync(product.id);
    },
    [logEvent, purchaseMutation, router, user],
  );

  return {
    freezesAvailable,
    products: products ?? [],
    isLoadingProducts,
    freezeDates: freezeDates ?? [],
    isPurchasing: purchaseMutation.isPending,
    canBuyProduct,
    onPurchase,
  };
};

export default useStreakFreeze;
