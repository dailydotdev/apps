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
  phoneLandscape,
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

export const useIsPhoneLandscape = (): boolean => {
  const check = useMediaClient(
    [phoneLandscape.replace('@media ', '')],
    [true],
    false,
  );

  return !isExtension && !!check;
};

// The same answer read at once: a phone from its first render. It is true
// on the server and can differ on a desktop's hydration render, so it is
// safe only where that render's output does not depend on it: UI that mounts
// after a tap, or a value that only gates a side effect such as a flag
// evaluation.
export const useIsPhoneNow = (): boolean => {
  const isBelowTablet = useViewSize(ViewSize.MobileL);

  return !isExtension && isBelowTablet;
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
