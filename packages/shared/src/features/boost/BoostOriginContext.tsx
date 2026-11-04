import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { Origin } from '../../lib/log';
import { safeContextHookExport } from '../../lib/func';

export type BoostOriginContextProps = {
  origin?: Origin;
  children?: ReactNode;
};

export type BoostOriginContext = {
  origin?: Origin;
};

const [BoostOriginContextProvider, useBoostOriginContextHook] =
  createContextProvider(
    ({ origin }: BoostOriginContextProps): BoostOriginContext =>
      useMemo(() => ({ origin }), [origin]),
    {
      errorMessage: 'ContextNotFound',
    },
  );

const useBoostOriginContext = safeContextHookExport(
  useBoostOriginContextHook,
  'ContextNotFound',
  {},
);

export { BoostOriginContextProvider, useBoostOriginContext };
