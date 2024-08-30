import { useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import { squadCategoriesPaths } from '../../../lib/constants';
import { useToggle } from '../../../hooks/useToggle';
import { useViewSize, ViewSize } from '../../../hooks';

export const useSquadDirectoryLayout = () => {
  const { squads } = useContext(AuthContext);
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
