import request from 'graphql-request';
import { browser } from 'webextension-polyfill-ts';

const proxyRequest = {
  apply(_, __, args) {
    browser.runtime.sendMessage({
      type: 'GRAPHQL_REQUEST',
      url: args?.[0],
      document: args?.[1],
      variables: args?.[2],
    });
    return null;
  },
};

export const companionRequest = new Proxy(request, proxyRequest);
