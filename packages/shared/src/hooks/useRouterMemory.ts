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
  replace: (
    url: string,
    as?: string,
    options?: Parameters<ReturnType<typeof useRouter>['replace']>[2],
  ) => Promise<boolean>;
};

type RouterMemoryState = Omit<UseRouterMemory, 'push' | 'replace'>;

const routerMemoryReducer = (
  state: RouterMemoryState,
  action: {
    type: 'push' | 'replace';
    payload: RouterMemoryState;
  },
): RouterMemoryState => {
  if (action.type === 'push' || action.type === 'replace') {
    return action.payload;
  }

  return state;
};

const createRouterInitialState = (): RouterMemoryState => {
  return {
    query: {},
    pathname: '/',
    asPath: '/',
  };
};

export const useRouterMemory = (): UseRouterMemory => {
  const [state, dispatch] = useReducer(
    routerMemoryReducer,
    undefined,
    createRouterInitialState,
  );

  const navigate = async (url: string, as?: string): Promise<boolean> => {
    // in memory router only supports url and as as strings, so we can convert
    // them to URL objects for internal handling, this is compatible with next/router
    const urlObject = new URL(url, 'http://localhost');
    const asObject = as ? new URL(as, 'http://localhost') : urlObject;

    dispatch({
      type: 'push',
      payload: {
        query: Object.fromEntries(urlObject.searchParams.entries()),
        pathname: urlObject.pathname,
        asPath: `${asObject.pathname}${
          asObject.search ? `?${asObject.search}` : ''
        }`,
      },
    });

    return true;
  };

  return {
    ...state,
    push: navigate,
    replace: navigate,
  };
};
