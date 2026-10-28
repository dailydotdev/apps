import { useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { squadCategoriesPaths } from '../../../lib/constants';
import { useSquadCategories } from '../../../hooks/squads/useSquadCategories';

export interface SquadDirectoryTab {
  label: string;
  path: string;
}

interface SquadDirectoryLayoutReturn {
  tabs: SquadDirectoryTab[];
}

export const useSquadDirectoryLayout = (): SquadDirectoryLayoutReturn => {
  const { user } = useAuthContext();
  const { data: categories } = useSquadCategories();

  // The fixed tabs render from the first paint; topics join once loaded.
  const tabs = useMemo(() => {
    const topics =
      categories?.pages
        .flatMap((page) => page.categories.edges)
        .map(({ node }) => ({
          label: node.title,
          path: `/squads/discover/${node.slug}`,
        })) ?? [];

    return [
      { label: 'Discover', path: squadCategoriesPaths.discover },
      ...(user
        ? [{ label: 'My Squads', path: squadCategoriesPaths['My Squads'] }]
        : []),
      { label: 'Featured', path: squadCategoriesPaths.featured },
      ...topics,
    ];
  }, [user, categories]);

  return { tabs };
};
