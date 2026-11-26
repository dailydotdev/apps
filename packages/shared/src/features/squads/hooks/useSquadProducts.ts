import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SquadProduct } from '../../../graphql/squadProducts';
import { squadProductsQueryOptions } from '../../../graphql/squadProducts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { hasSquadFeature } from '../lib/features';
import { useOptionalSquadPageContext } from '../SquadPageContext';

interface UseSquadProducts {
  isEnabled: boolean;
  products: SquadProduct[];
  isPending: boolean;
  queryKey: readonly unknown[];
}

export const useSquadProducts = (squad: Squad): UseSquadProducts => {
  const { user } = useAuthContext();
  const page = useOptionalSquadPageContext();
  const options = squadProductsQueryOptions({ squad, user });
  const { data, isPending } = useQuery({
    ...options,
    placeholderData: page?.initialContent?.products,
  });

  return {
    isEnabled: hasSquadFeature(squad, 'products'),
    products: data ?? [],
    isPending,
    queryKey: options.queryKey,
  };
};
