import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { isExtension } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import {
  SPOTLIGHT_ACTIONS_QUERY,
  type SpotlightAction,
} from '../../graphql/spotlight';
import { SpotlightScope } from './types';
import type { SpotlightSource } from './types';
import { registerSpotlightShortcutBlocker } from './shortcuts';

type SpotlightActionsResponse = { spotlightActions: SpotlightAction[] };

export const SPOTLIGHT_ACTIONS_QUERY_KEY = ['spotlight', 'actions'];

const getSpotlightActions = async (): Promise<SpotlightAction[]> => {
  const result = await gqlClient.request<SpotlightActionsResponse>(
    SPOTLIGHT_ACTIONS_QUERY,
  );

  return result.spotlightActions;
};

const spotlightActionsQueryOptions = {
  queryKey: SPOTLIGHT_ACTIONS_QUERY_KEY,
  queryFn: getSpotlightActions,
  staleTime: Infinity,
};

const platformId = isExtension ? 'extension' : 'webapp';

export interface SpotlightSourceOptions {
  /** Prefills the field, e.g. with the query of the squad's results page. */
  query?: string;
}

interface PageSource extends SpotlightSourceOptions {
  source: SpotlightSource;
}

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
  /**
   * The squad this session was opened for. It stays set after the pill is
   * removed, so the palette can offer to narrow back to it.
   */
  source: SpotlightSource | null;
  /** True while results are narrowed to `source` (the pill is showing). */
  isSourceScoped: boolean;
  /** Open the modal narrowed to one squad's posts. */
  openWithSource: (
    source: SpotlightSource,
    options?: SpotlightSourceOptions,
  ) => void;
  /** Narrow back to `source` after widening. */
  scopeToSource: () => void;
  /** Remove the pill and search all of daily.dev, keeping the query. */
  clearSourceScope: () => void;
  /**
   * Opens the way the keyboard shortcut does: narrowed to the page's squad
   * when one is registered through `useSpotlightPageSource`.
   */
  openFromShortcut: () => void;
  registerPageSource: (entry: PageSource) => () => void;
  /**
   * Warm the action catalog before the modal opens. Call it from hover/focus
   * on anything that opens Spotlight so the list is there on click; the query
   * never goes stale, so repeat calls are free.
   */
  prefetch: () => void;
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
  const [source, setSource] = useState<SpotlightSource | null>(null);
  const [isSourceScoped, setIsSourceScoped] = useState(false);
  const pageSourceRef = useRef<PageSource | null>(null);

  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: rawActions, isPending: isActionsLoading } = useQuery({
    ...spotlightActionsQueryOptions,
    enabled: isOpen,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const prefetch = useCallback(() => {
    queryClient.prefetchQuery(spotlightActionsQueryOptions);
  }, [queryClient]);

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
    setSource(null);
    setIsSourceScoped(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setQueryState('');
        setPendingConfirmId(null);
        setPages([]);
        setSource(null);
        setIsSourceScoped(false);
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
    setSource(null);
    setIsSourceScoped(false);
    setIsOpen(true);
  }, []);

  const openWithSource = useCallback(
    (next: SpotlightSource, options?: SpotlightSourceOptions) => {
      setPages([]);
      setQueryState(options?.query ?? '');
      setPendingConfirmId(null);
      setSource(next);
      setIsSourceScoped(true);
      setIsOpen(true);
    },
    [],
  );

  const scopeToSource = useCallback(() => {
    setPages([]);
    setIsSourceScoped(true);
  }, []);

  const clearSourceScope = useCallback(() => {
    setIsSourceScoped(false);
  }, []);

  const openFromShortcut = useCallback(() => {
    const pageSource = pageSourceRef.current;
    if (pageSource) {
      openWithSource(pageSource.source, { query: pageSource.query });
      return;
    }
    setIsOpen(true);
  }, [openWithSource]);

  const registerPageSource = useCallback((entry: PageSource) => {
    pageSourceRef.current = entry;
    return () => {
      if (pageSourceRef.current === entry) {
        pageSourceRef.current = null;
      }
    };
  }, []);

  const pushScope = useCallback((next: SpotlightScope) => {
    // A type filter replaces the squad pill: the two never stack.
    setIsSourceScoped(false);
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
      source,
      isSourceScoped,
      openWithSource,
      scopeToSource,
      clearSourceScope,
      openFromShortcut,
      registerPageSource,
      prefetch,
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
      source,
      isSourceScoped,
      openWithSource,
      scopeToSource,
      clearSourceScope,
      openFromShortcut,
      registerPageSource,
      prefetch,
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

/**
 * Lets a page make its squad the default scope of the keyboard shortcut, so
 * ⌘K on a squad page searches that squad (the pill widens it back to all of
 * daily.dev). Pass the page's current search query to prefill the field.
 */
export const useSpotlightPageSource = (
  source?: SpotlightSource | null,
  options?: SpotlightSourceOptions,
): void => {
  const { registerPageSource } = useSpotlight();
  const { id, handle, name, image } = source ?? {};
  const query = options?.query;

  useEffect(() => {
    if (!id || !handle || !name) {
      return undefined;
    }

    return registerPageSource({ source: { id, handle, name, image }, query });
  }, [registerPageSource, id, handle, name, image, query]);
};
