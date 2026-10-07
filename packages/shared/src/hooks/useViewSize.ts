import { useMemo } from 'react';
import { useMedia, useMediaClient } from './useMedia';
import { isExtension } from '../lib/func';
import {
  desktop,
  desktopL,
  laptop,
  laptopL,
  laptopXL,
  mobileL,
  mobileXL,
  tablet,
} from '../styles/media';

export enum ViewSize {
  MobileM = 'mobileM',
  MobileL = 'mobileL',
  MobileXL = 'mobileXL',
  Tablet = 'tablet',
  Laptop = 'laptop',
  LaptopL = 'laptopL',
  LaptopXL = 'laptopXL',
  Desktop = 'desktop',
  DesktopL = 'desktopL',
}

const reversedEvaluatedSizes = [
  ViewSize.MobileM,
  ViewSize.MobileL,
  ViewSize.MobileXL,
];

const viewSizeToQuery = {
  [ViewSize.MobileM]: mobileL,
  [ViewSize.MobileL]: tablet,
  [ViewSize.MobileXL]: mobileXL,
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
    false,
  );

  return useMemo(() => {
    return reversedEvaluatedSizes.includes(size) ? !check : check;
  }, [check, size]);
};

// The phone shell swaps markup by viewport, so the server and the first
// client render must agree: both say "not a phone" and the answer lands
// after mount. The extension's new tab has no shell at any width.
export const useIsPhone = (): boolean => {
  const check = useMediaClient(
    [viewSizeToQuery[ViewSize.MobileL].replace('@media ', '')],
    [true],
    false,
  );

  return !isExtension && check !== undefined && !check;
};

export const useViewSizeClient = (size: ViewSize): boolean => {
  const check = useMediaClient(
    [viewSizeToQuery[size].replace('@media ', '')],
    [true],
    false,
  );

  return useMemo(() => {
    return reversedEvaluatedSizes.includes(size) ? !check : check;
  }, [check, size]);
};

export { useViewSize };
