import { createContextProvider } from '@kickass-coderz/react';
import type { MutableRefObject, ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { mergeContextExtra, safeContextHookExport } from '../lib/func';
import type { LogEvent } from '../hooks/log/useLogQueue';

export type LogExtraContextProps = {
  selector?: () => Record<string, unknown>;
  children?: ReactNode;
};

export type LogExtraContext = {
  selectorRef: MutableRefObject<(props: { event: LogEvent }) => LogEvent>;
};

const [LogExtraContextProvider, useLogExtraContextHook] = createContextProvider(
  ({ selector }: LogExtraContextProps): LogExtraContext => {
    const extraSelector = ({ event }: { event: LogEvent }): LogEvent => {
      const data = selector?.();

      return mergeContextExtra({ event, data });
    };

    const selectorRef = useRef(extraSelector);
    selectorRef.current = extraSelector;

    return useMemo(() => {
      return {
        selectorRef,
      };
    }, []);
  },
  {
    errorMessage: 'ContextNotFound',
  },
);

const useLogExtraContext = safeContextHookExport(
  useLogExtraContextHook,
  'ContextNotFound',
  {
    selectorRef: { current: ({ event }) => event },
  },
);

export { LogExtraContextProvider, useLogExtraContext };
