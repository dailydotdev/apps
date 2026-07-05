import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { isExtension } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import {
  SPOTLIGHT_ACTIONS_QUERY,
  type SpotlightAction,
} from '../../graphql/spotlight';
import { SpotlightScope } from './types';
import { registerSpotlightShortcutBlocker } from './shortcuts';

type SpotlightActionsResponse = { spotlightActions: SpotlightAction[] };

export const SPOTLIGHT_ACTIONS_QUERY_KEY = ['spotlight', 'actions'];

const platformId = isExtension ? 'extension' : 'webapp';

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
  /** Action catalog from the API, filtered by current user's auth/plus/platform. */
  actions: SpotlightAction[];
  isActionsLoading: boolean;
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

  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: rawActions, isPending: isActionsLoading } = useQuery({
    queryKey: SPOTLIGHT_ACTIONS_QUERY_KEY,
    queryFn: async () => {
      const result = await gqlClient.request<SpotlightActionsResponse>(
        SPOTLIGHT_ACTIONS_QUERY,
      );
      return result.spotlightActions;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const actions = useMemo<SpotlightAction[]>(() => {
    return (rawActions ?? []).filter((action) => {
      if (action.requiresAuth && !isLoggedIn) {
        return false;
      }
      if (action.requiresPlus && !isPlus) {
        return false;
      }
      if (action.platforms?.length && !action.platforms.includes(platformId)) {
        return false;
      }
      return true;
    });
  }, [rawActions, isLoggedIn, isPlus]);

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
      actions,
      isActionsLoading,
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
      actions,
      isActionsLoading,
    ],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
    </SpotlightContext.Provider>
  );
};

export const useSpotlight = (): SpotlightContextValue => {
  const ctx = useContext(SpotlightContext);
  if (!ctx) {
    throw new Error('useSpotlight must be used within SpotlightProvider');
  }
  return ctx;
};

export const useDisableSpotlightShortcut = (enabled = true): void => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return registerSpotlightShortcutBlocker();
  }, [enabled]);
};
