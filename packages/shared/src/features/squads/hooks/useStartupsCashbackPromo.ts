import { useQuery } from '@tanstack/react-query';
import { startupsCashbackPromoQueryOptions } from '../../../graphql/squadSubscription';
import type { StartupsCashbackPromo } from '../lib/plans';

/** The launch promo cashback for new subscriptions, null while it is off. */
export const useStartupsCashbackPromo = (): StartupsCashbackPromo | null => {
  const { data } = useQuery(startupsCashbackPromoQueryOptions());

  return data ?? null;
};
