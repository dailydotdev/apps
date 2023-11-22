import { useMemo } from 'react';
import { useMedia } from './useMedia';
import { laptop, laptopL, tablet } from '../styles/media';

type ViewSize = {
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isLaptopL: boolean;
};
const useViewSize = (): ViewSize => {
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);
  const isTablet = useMedia([tablet.replace('@media ', '')], [true], false);
  const isLaptop = useMedia([laptop.replace('@media ', '')], [true], false);
  const isLaptopL = useMedia([laptopL.replace('@media ', '')], [true], false);

  return useMemo(() => {
    return {
      isMobile,
      isTablet,
      isLaptop,
      isLaptopL,
    };
  }, [isMobile, isTablet, isLaptop, isLaptopL]);
};
export { useViewSize };
