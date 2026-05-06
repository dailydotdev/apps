import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { SpotlightScope } from './types';

export interface SpotlightContextValue {
  isOpen: boolean;
  query: string;
  /** Inline destructive-confirm gate: the command id awaiting confirm. */
  pendingConfirmId: string | null;
  /**
   * cmdk-style pages stack for scope filtering. Empty stack = `All`. Top of
   * the stack is the active scope. Backspace on empty input pops the top.
   */
  pages: SpotlightScope[];
  /** Convenience accessor for the active scope (`All` when stack is empty). */
  scope: SpotlightScope;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (value: string) => void;
  requestConfirm: (commandId: string) => void;
  clearConfirm: () => void;
  /** Open the modal pre-scoped to a specific entity type. */
  openWithScope: (scope: SpotlightScope) => void;
  /** Push a scope page onto the stack while the modal is already open. */
  pushScope: (scope: SpotlightScope) => void;
  /** Pop the top scope page (no-op when already at `All`). */
  popScope: () => void;
  /** Reset the stack to `All`. */
  clearScope: () => void;
}

export const SpotlightContext = createContext<SpotlightContextValue | null>(
  null,
);

interface SpotlightProviderProps {
  children: ReactNode;
}

export const SpotlightProvider = ({
  children,
}: SpotlightProviderProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [pages, setPages] = useState<SpotlightScope[]>([]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQueryState('');
    setPendingConfirmId(null);
    setPages([]);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setQueryState('');
        setPendingConfirmId(null);
        setPages([]);
      }
      return !prev;
    });
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setPendingConfirmId(null);
  }, []);

  const requestConfirm = useCallback((commandId: string) => {
    setPendingConfirmId(commandId);
  }, []);

  const clearConfirm = useCallback(() => {
    setPendingConfirmId(null);
  }, []);

  const openWithScope = useCallback((next: SpotlightScope) => {
    setPages(next === SpotlightScope.All ? [] : [next]);
    setQueryState('');
    setPendingConfirmId(null);
    setIsOpen(true);
  }, []);

  const pushScope = useCallback((next: SpotlightScope) => {
    // Keep the active query when narrowing scope. The chip is a filter, not
    // a fresh search — clearing the query here would empty the entity lists
    // (search hooks return nothing without a query) and the user would see
    // a blank list right after clicking the very chip that promised matches.
    setPages((prev) => {
      if (next === SpotlightScope.All) {
        return [];
      }
      if (prev[prev.length - 1] === next) {
        return prev;
      }
      return [...prev, next];
    });
  }, []);

  const popScope = useCallback(() => {
    setPages((prev) => prev.slice(0, -1));
  }, []);

  const clearScope = useCallback(() => {
    setPages([]);
  }, []);

  const scope = pages[pages.length - 1] ?? SpotlightScope.All;

  const value = useMemo<SpotlightContextValue>(
    () => ({
      isOpen,
      query,
      pendingConfirmId,
      pages,
      scope,
      open,
      close,
      toggle,
      setQuery,
      requestConfirm,
      clearConfirm,
      openWithScope,
      pushScope,
      popScope,
      clearScope,
    }),
    [
      isOpen,
      query,
      pendingConfirmId,
      pages,
      scope,
      open,
      close,
      toggle,
      setQuery,
      requestConfirm,
      clearConfirm,
      openWithScope,
      pushScope,
      popScope,
      clearScope,
    ],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
    </SpotlightContext.Provider>
  );
};
