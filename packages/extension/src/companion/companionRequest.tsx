import request from 'graphql-request';
import { browser } from 'webextension-polyfill-ts';
import { initialDataKey } from '@dailydotdev/shared/src/lib/constants';

const proxyRequest = {
  apply(_, __, args) {
    const { [initialDataKey]: initial, ...variables } = args?.[2];

    browser.runtime.sendMessage({
      type: 'GRAPHQL_REQUEST',
      url: args?.[0],
      document: args?.[1],
      variables,
      headers: args?.[3],
    });

    return initial ?? null;
  },
};

export const companionRequest = new Proxy(request, proxyRequest);
