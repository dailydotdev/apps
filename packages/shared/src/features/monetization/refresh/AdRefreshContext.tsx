import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { useIsPhone } from '../../../hooks/useViewSize';
import { safeContextHookExport } from '../../../lib/func';
import { AdRefreshPlatform, getAdRefreshPlatform } from './adRefresh';

export type AdRefreshContextProps = {
  version?: string;
  children?: ReactNode;
};

export type AdRefreshContext = {
  platform: AdRefreshPlatform;
  getSessionCount: () => number;
  countSessionRefresh: () => void;
};

const [AdRefreshContextProvider, useAdRefreshContextHook] =
  createContextProvider(
    ({ version }: AdRefreshContextProps): AdRefreshContext => {
      const isPhone = useIsPhone();
      const sessionCount = useRef(0);
      const platform = getAdRefreshPlatform({ version, isPhone });

      return useMemo(
        () => ({
          platform,
          getSessionCount: () => sessionCount.current,
          countSessionRefresh: () => {
            sessionCount.current += 1;
          },
        }),
        [platform],
      );
    },
    {
      errorMessage: 'ContextNotFound',
    },
  );

const useAdRefreshContext = safeContextHookExport(
  useAdRefreshContextHook,
  'ContextNotFound',
  {
    platform: AdRefreshPlatform.WebDesktop,
    getSessionCount: () => Number.POSITIVE_INFINITY,
    countSessionRefresh: () => {},
  },
);

export { AdRefreshContextProvider, useAdRefreshContext };
