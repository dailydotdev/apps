/* eslint-disable class-methods-use-this */
import { NextRouter } from 'next/router';
import { UrlObject } from 'url';
import { MittEmitter } from 'next/dist/shared/lib/mitt';
import { RouterEvent } from 'next/dist/client/router';

declare type Url = UrlObject | string;

export default class CustomRouter implements NextRouter {
  asPath = '/';

  back(): void {
    window.history.back();
  }

  basePath = '/';

  beforePopState(): void {
    // No need to do anything
  }

  events = {
    on: () => {
      // No need to do anything
    },
    off: () => {
      // No need to do anything
    },
  } as unknown as MittEmitter<RouterEvent>;

  isFallback = false;

  isLocaleDomain = false;

  isPreview = false;

  isReady = true;

  pathname = '/';

  prefetch(): Promise<void> {
    return Promise.resolve();
  }

  async push(url: Url): Promise<boolean> {
    window.location.href = url as string;
    return true;
  }

  query = {};

  reload(): void {
    window.location.reload();
  }

  async replace(url: Url): Promise<boolean> {
    window.location.href = url as string;
    return true;
  }

  route = '/';
}
