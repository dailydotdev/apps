import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { safeContextHookExport } from '../lib/func';

export type ShellStateContextProps = {
  isSettled: boolean;
  children?: ReactNode;
};

export type ShellState = {
  isSettled: boolean;
};

const [ShellStateContextProvider, useShellStateHook] = createContextProvider(
  ({ isSettled }: ShellStateContextProps): ShellState =>
    useMemo(() => ({ isSettled }), [isSettled]),
  {
    errorMessage: 'ShellStateContextNotFound',
  },
);

const useShellState = safeContextHookExport(
  useShellStateHook,
  'ShellStateContextNotFound',
  { isSettled: true },
);

export { ShellStateContextProvider, useShellState };
