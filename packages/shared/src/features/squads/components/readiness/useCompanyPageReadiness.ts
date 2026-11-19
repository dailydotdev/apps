import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import { squadProductsQueryOptions } from '../../../../graphql/squadProducts';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { hasSquadFeature } from '../../lib/features';
import type { ReadinessItem } from '../../lib/readiness';
import { getCompanyPageReadinessItems } from '../../lib/readiness';

interface CompanyPageReadiness {
  isPending: boolean;
  /** Missing when the page opened, with their state now */
  rows: ReadinessItem[];
  done: ReadinessItem[];
}

/**
 * The page's and the viewer's readiness rows. Which rows are listed is fixed
 * the first time everything is known, so a row the admin finishes in another
 * tab, or through their agent, gets checked in place instead of jumping away.
 */
export const useCompanyPageReadiness = (
  squad: Squad,
  isShown: boolean,
): CompanyPageReadiness => {
  const { user } = useAuthContext();
  const hasProducts = hasSquadFeature(squad, 'products');
  const { data: products, isPending: isProductsPending } = useQuery({
    ...squadProductsQueryOptions({ squad, user }),
    enabled: isShown && hasProducts,
  });
  const missingIds = useRef<string[] | null>(null);
  const isPending = !user || (hasProducts && isProductsPending);

  if (!isShown || isPending) {
    return { isPending, rows: [], done: [] };
  }

  const items = getCompanyPageReadinessItems({
    squad,
    user,
    hasLinks: hasSquadFeature(squad, 'links'),
    products: hasProducts ? (products?.length ?? 0) : undefined,
  });

  if (!missingIds.current) {
    missingIds.current = items
      .filter(({ isDone }) => !isDone)
      .map(({ id }) => id);
  }

  const missing = new Set(missingIds.current);

  return {
    isPending: false,
    rows: items.filter(({ id }) => missing.has(id)),
    done: items.filter(({ id, isDone }) => isDone && !missing.has(id)),
  };
};
