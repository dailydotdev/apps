import { MouseEvent } from 'react';
import { EmptyObjectLiteral } from './kratos';
import { BROADCAST_CHANNEL_NAME } from './constants';

interface BroadcastMessage {
  eventKey: string;
  [key: string]: unknown;
}

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

export const broadcastMessage = (
  message: BroadcastMessage,
  channelName: string = BROADCAST_CHANNEL_NAME,
): void => {
  const channel = new BroadcastChannel(channelName);
  channel.postMessage(message);
  channel.close();
};

export const checkIsExtension = (): boolean => !!process.env.TARGET_BROWSER;
export const isExtension = !!process.env.TARGET_BROWSER;

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
