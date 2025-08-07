import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { safeContextHookExport } from '../lib/func';

export type LogExtraContextProps = {
  data?: unknown;
  selector?: (data: unknown) => Record<string, unknown>;
  children?: ReactNode;
};

export type LogExtraContext = {
  extra?: Record<string, unknown>;
};

const [LogExtraContextProvider, useLogExtraContextHook] = createContextProvider(
  ({ data, selector }: LogExtraContextProps): LogExtraContext => {
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    return useMemo(() => {
      return {
        extra: selectorRef.current ? selectorRef.current(data) : undefined,
      };
    }, [data]);
  },
  {
    errorMessage: 'ContextNotFound',
  },
);

const useLogExtraContext = safeContextHookExport(
  useLogExtraContextHook,
  'ContextNotFound',
  {},
);

export { LogExtraContextProvider, useLogExtraContext };
