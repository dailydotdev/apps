import { useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { squadCategoriesPaths } from '../../../lib/constants';
import { useViewSize, ViewSize } from '../../../hooks';
import type { Squad } from '../../../graphql/sources';
import { useSquadCategories } from '../../../hooks/squads/useSquadCategories';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';

interface SquadDirectoryLayoutReturn {
  hasSquad: boolean;
  squads: Squad[];
  categoryPaths: Record<string, string>;
  isMobileLayout: boolean;
}

export const useSquadDirectoryLayout = (): SquadDirectoryLayoutReturn => {
  const { squads = [] } = useAuthContext();
  const hasSquad = !!squads?.length;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const { data: categories, isFetched } = useSquadCategories();

  const tabs = useMemo(() => {
    const path: Partial<Record<string, string>> = { ...squadCategoriesPaths };

    if (!isFetched) {
      return {};
    }

    // v2 surfaces the user's squads in the sidebar panel, so the redundant
    // "My Squads" directory tab is dropped there.
    if (!hasSquad || isV2) {
      delete path['My Squads'];
    }

    const flatCategories =
      categories?.pages.flatMap((page) => page.categories.edges) ?? [];

    return flatCategories.reduce(
      (result, { node }) => ({
        ...result,
        [node.title]: `/squads/discover/${node.slug}`,
      }),
      path,
    );
  }, [hasSquad, categories, isFetched, isV2]);

  return {
    hasSquad,
    squads,
    categoryPaths: tabs as Record<string, string>,
    isMobileLayout: !isLaptop,
  };
};
