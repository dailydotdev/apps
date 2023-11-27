import { useMemo } from 'react';
import { useMedia } from './useMedia';
import {
  desktop,
  desktopL,
  laptop,
  laptopL,
  laptopXL,
  mobileL,
  tablet,
} from '../styles/media';

export enum ViewSize {
  MobileM = 'mobileM',
  MobileL = 'mobileL',
  Tablet = 'tablet',
  Laptop = 'laptop',
  LaptopL = 'laptopL',
  LaptopXL = 'laptopXL',
  Desktop = 'desktop',
  DesktopL = 'desktopL',
}

const reversedEvaluatedSizes = [ViewSize.MobileM, ViewSize.MobileL];

const viewSizeToQuery = {
  [ViewSize.MobileM]: mobileL,
  [ViewSize.MobileL]: tablet,
  [ViewSize.Tablet]: tablet,
  [ViewSize.Laptop]: laptop,
  [ViewSize.LaptopL]: laptopL,
  [ViewSize.LaptopXL]: laptopXL,
  [ViewSize.Desktop]: desktop,
  [ViewSize.DesktopL]: desktopL,
};

const useViewSize = (size: ViewSize): boolean => {
  const check = useMedia(
    [viewSizeToQuery[size].replace('@media ', '')],
    [true],
    false,
    null,
  );

  return useMemo(() => {
    return reversedEvaluatedSizes.includes(size) ? !check : check;
  }, [check, size]);
};
export { useViewSize };
