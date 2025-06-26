import type { useRouter } from 'next/router';
import { useReducer } from 'react';

export type UseRouterMemory = Pick<
  ReturnType<typeof useRouter>,
  'query' | 'pathname' | 'asPath'
> & {
  push: (
    url: string,
    as?: string,
    options?: Parameters<ReturnType<typeof useRouter>['push']>[2],
  ) => Promise<boolean>;
};

type RouterMemoryState = Omit<UseRouterMemory, 'push'>;

const routerMemoryReducer = (
  state: RouterMemoryState,
  action: {
    type: 'push';
    payload: RouterMemoryState;
  },
): RouterMemoryState => {
  if (action.type === 'push') {
    return action.payload;
  }

  return state;
};

const createRouterInitialState = (): RouterMemoryState => {
  return {
    query: {},
    pathname: '/',
    asPath: undefined,
  };
};

export const useRouterMemory = (): UseRouterMemory => {
  const [state, dispatch] = useReducer(
    routerMemoryReducer,
    undefined,
    createRouterInitialState,
  );

  return {
    ...state,
    push: async (url, as) => {
      // in memory router only supports url and as as strings, so we can convert
      // them to URL objects for internal handling, this is compatible with next/router
      const urlObject = new URL(url, 'http://localhost');
      const asObject = as ? new URL(as, 'http://localhost') : undefined;

      dispatch({
        type: 'push',
        payload: {
          query: Object.fromEntries(urlObject.searchParams.entries()),
          pathname: urlObject.pathname,
          asPath: asObject?.pathname,
        },
      });

      return true;
    },
  };
};
