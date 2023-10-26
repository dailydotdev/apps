import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import browser from 'webextension-polyfill';

const proxyFetch = {
  apply(_, __, args) {
    browser.runtime.sendMessage({
      type: ExtensionMessageType.FetchRequest,
      url: args[0],
      args: args[1],
    });
    return null;
  },
};

export const companionFetch = new Proxy(fetch, proxyFetch);
