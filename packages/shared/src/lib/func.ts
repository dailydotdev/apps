import type { MouseEvent } from 'react';
import type ReactModal from 'react-modal';
import type { EmptyObjectLiteral } from './kratos';
import { isBrave, isTesting } from './constants';

export type EmptyFunction = () => void;
export type EmptyPromise = () => Promise<void>;

export const nextTick = (): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve));

export const parseOrDefault = <T = unknown>(data: string): T | string => {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return data;
  }
};

export const isNullOrUndefined = (param: unknown): boolean =>
  typeof param === 'undefined' || param === null;

export const disabledRefetch = {
  refetchIntervalInBackground: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
};

Object.freeze(disabledRefetch);

export const postWindowMessage = (
  eventKey: string,
  params: EmptyObjectLiteral,
  attributes = '*',
): void => window.opener?.postMessage?.({ ...params, eventKey }, attributes);

export const checkIsExtension = (): boolean => !!process.env.TARGET_BROWSER;
export const isExtension = !!process.env.TARGET_BROWSER;

export const isPWA = (): boolean =>
  // @ts-expect-error - Safari only, not web standard.
  globalThis?.navigator?.standalone ||
  globalThis?.matchMedia('(display-mode: standalone)')?.matches;

export const defaultSearchDebounceMs = 500;

export const getRandomNumber = (min: number, max: number): number => {
  const range = max - min + 1;

  return Math.floor(Math.random() * range) + min;
};

export const isSpecialKeyPressed = ({
  event,
}: {
  event: MouseEvent | KeyboardEvent;
}): boolean => {
  return event.ctrlKey || event.metaKey;
};

const appleDeviceMatch = /(Mac|iPhone|iPod|iPad)/i;

export const isAppleDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return appleDeviceMatch.test(window.navigator.platform);
};

export const isIOS = (): boolean =>
  /iPhone|iPad/i.test(globalThis?.navigator.userAgent);

export enum ArrowKeyEnum {
  Up = 'ArrowUp',
  Right = 'ArrowRight',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
}

export const wrapStopPropagation =
  (callback: () => void): ((event: MouseEvent) => unknown) =>
  (event: MouseEvent) => {
    event.stopPropagation();
    callback();
  };

export const sortAlphabeticallyByProperty =
  <T>(property: keyof T) =>
  (a: T, b: T): number => {
    if (a[property] < b[property]) {
      return -1;
    }

    if (a[property] > b[property]) {
      return 1;
    }

    return 0;
  };

export enum UserAgent {
  Chrome = 'Chrome',
  CriOS = 'CriOS', // Chrome running on iOS
  Edge = 'Edg', // intended to be Edg, not Edge
  Android = 'Android',
  Firefox = 'Firefox',
  Safari = 'Safari',
}

export enum BrowserName {
  Chrome = 'Chrome',
  Brave = 'Brave',
  Firefox = 'Firefox',
  Safari = 'Safari',
  Edge = 'Edge',
  Other = 'Other',
}

export const checkIsBrowser = (agent: UserAgent): boolean =>
  globalThis?.navigator?.userAgent?.includes(agent);

export const checkIsChromeOnly = (): boolean =>
  (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.CriOS)) &&
  !checkIsBrowser(UserAgent.Edge);

export const getCurrentBrowserName = (): BrowserName => {
  if (checkIsChromeOnly()) {
    return BrowserName.Chrome;
  }

  if (isBrave()) {
    return BrowserName.Brave;
  }

  if (checkIsBrowser(UserAgent.Firefox)) {
    return BrowserName.Firefox;
  }

  if (checkIsBrowser(UserAgent.Edge)) {
    return BrowserName.Edge;
  }

  if (checkIsBrowser(UserAgent.Safari)) {
    return BrowserName.Safari;
  }

  return BrowserName.Other;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = array.slice();

  // fisher-yates
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }

  return newArray;
};

export const initReactModal = ({
  modalObject,
  appElement,
  defaultStyles,
}: {
  modalObject: {
    setAppElement: (element: string | HTMLElement) => void;
    defaultStyles: ReactModal.Styles;
  };
  appElement: string | HTMLElement;
  defaultStyles?: ReactModal.Styles;
}): void => {
  if (isTesting) {
    return;
  }

  if (globalThis.reactModalInit) {
    return;
  }

  modalObject.setAppElement(appElement);
  // eslint-disable-next-line no-param-reassign
  modalObject.defaultStyles = defaultStyles || {};

  globalThis.reactModalInit = true;
};

export const isMobile = (): boolean =>
  globalThis?.localStorage.mobile || globalThis?.navigator.maxTouchPoints > 1;

export const shouldUseNativeShare = (): boolean =>
  'share' in globalThis?.navigator && isMobile();
