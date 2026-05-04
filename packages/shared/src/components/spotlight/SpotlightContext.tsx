import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useMemo, useState } from 'react';

export interface SpotlightContextValue {
  isOpen: boolean;
  query: string;
  /** Inline destructive-confirm gate: the command id awaiting confirm. */
  pendingConfirmId: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (value: string) => void;
  requestConfirm: (commandId: string) => void;
  clearConfirm: () => void;
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

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQueryState('');
    setPendingConfirmId(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setQueryState('');
        setPendingConfirmId(null);
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

  const value = useMemo<SpotlightContextValue>(
    () => ({
      isOpen,
      query,
      pendingConfirmId,
      open,
      close,
      toggle,
      setQuery,
      requestConfirm,
      clearConfirm,
    }),
    [
      isOpen,
      query,
      pendingConfirmId,
      open,
      close,
      toggle,
      setQuery,
      requestConfirm,
      clearConfirm,
    ],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
    </SpotlightContext.Provider>
  );
};
