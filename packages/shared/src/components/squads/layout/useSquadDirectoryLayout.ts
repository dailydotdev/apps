import { useAuthContext } from '../../../contexts/AuthContext';
import { squadCategoriesPaths } from '../../../lib/constants';
import { useToggle } from '../../../hooks/useToggle';
import { useViewSize, ViewSize } from '../../../hooks';
import { Squad } from '../../../graphql/sources';

interface SquadDirectoryLayoutReturn {
  hasSquad: boolean;
  squads: Squad[];
  mySquadsTab: {
    isVisible: boolean;
    isActive: boolean;
    toggle: (val?: boolean) => void;
  };
  categoryPaths: Record<string, string>;
  isMobileLayout: boolean;
}

export const useSquadDirectoryLayout = (): SquadDirectoryLayoutReturn => {
  const { squads = [] } = useAuthContext();
  const hasSquad = !!squads?.length;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [isMySquadsActive, setIsMySquadsActive] = useToggle(false);

  return {
    hasSquad,
    squads,
    mySquadsTab: {
      isVisible: hasSquad && !isLaptop,
      isActive: isMySquadsActive,
      toggle: setIsMySquadsActive,
    },
    categoryPaths: squadCategoriesPaths,
    isMobileLayout: !isLaptop,
  };
};
