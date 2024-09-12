import { useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { squadCategoriesPaths } from '../../../lib/constants';
import { useViewSize, ViewSize } from '../../../hooks';
import { Squad } from '../../../graphql/sources';
import { useSquadCategories } from '../../../hooks/squads/useSquadCategories';

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
  const { data: categories, isFetched } = useSquadCategories();

  const tabs = useMemo(() => {
    const path = { ...squadCategoriesPaths };

    if (!isFetched) {
      return {};
    }

    if (isLaptop || !hasSquad) {
      delete path['My Squads'];
    }

    const flatCategories =
      categories?.pages.flatMap((page) => page.categories.edges) ?? [];

    return flatCategories.reduce(
      (result, { node }) => ({
        ...result,
        [node.title]: `/squads/discover/${node.id}`,
      }),
      path,
    );
  }, [hasSquad, isLaptop, categories, isFetched]);

  return {
    hasSquad,
    squads,
    categoryPaths: tabs,
    isMobileLayout: !isLaptop,
  };
};
