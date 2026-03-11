import type { useRouter } from 'next/router';
import { useState } from 'react';

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

const createRouterInitialState = (): RouterMemoryState => {
  return {
    query: {},
    pathname: '/',
    asPath: '/',
  };
};

const getRouterState = (url: string, as?: string): RouterMemoryState => {
  // in memory router only supports url and as as strings, so we can convert
  // them to URL objects for internal handling, this is compatible with next/router
  const urlObject = new URL(url, 'http://localhost');
  const asObject = as ? new URL(as, 'http://localhost') : urlObject;

  return {
    query: Object.fromEntries(urlObject.searchParams.entries()),
    pathname: urlObject.pathname,
    asPath: `${asObject.pathname}${
      asObject.search ? `?${asObject.search}` : ''
    }`,
  };
};

export const useRouterMemory = (): UseRouterMemory => {
  const [state, setState] = useState(createRouterInitialState);

  const navigate = async (url: string, as?: string): Promise<boolean> => {
    setState(getRouterState(url, as));

    return true;
  };

  return {
    ...state,
    push: navigate,
    replace: navigate,
  };
};
