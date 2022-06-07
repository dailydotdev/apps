import { browser } from 'webextension-polyfill-ts';

const proxyFetch = {
  apply(_, __, args) {
    browser.runtime.sendMessage({
      type: 'FETCH_REQUEST',
      url: args[0],
      args: args[1],
    });
    return null;
  },
};

export const companionFetch = new Proxy(fetch, proxyFetch);
