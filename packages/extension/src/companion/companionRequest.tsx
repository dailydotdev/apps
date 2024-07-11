import browser from 'webextension-polyfill';
import { initialDataKey } from '@dailydotdev/shared/src/lib/constants';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { gqlRequest } from '@dailydotdev/shared/src/graphql/common';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';

const proxyRequest = {
  apply(_, __, args) {
    const { [initialDataKey]: initial, ...variables } = args?.[1];

    browser.runtime.sendMessage({
      type: ExtensionMessageType.GraphQLRequest,
      url: graphqlUrl,
      document: args?.[0],
      variables,
      headers: args?.[2],
    });

    return initial ?? null;
  },
};

export const companionRequest = new Proxy(gqlRequest, proxyRequest);
