import { NextRouter } from 'next/router';
import { UrlObject } from 'url';

declare type Url = UrlObject | string;

export default class CustomRouter implements NextRouter {
  asPath = '/';

  back(): void {
    history.back();
  }

  basePath = '/';

  beforePopState(): void {
    // No need to do anything
  }

  events = null;
  isFallback = false;
  isLocaleDomain = false;
  isPreview = false;
  isReady = true;
  pathname = '/';

  prefetch(): Promise<void> {
    return Promise.resolve();
  }

  async push(url: Url): Promise<boolean> {
    window.history.pushState({}, '', url as string);
    return true;
  }

  query = {};

  reload(): void {
    window.location.reload();
  }

  replace(url: Url): Promise<boolean> {
    window.history.pushState({}, '', url as string);
    return;
  }

  route = '/';
}
