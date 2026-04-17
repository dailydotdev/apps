import type { MutableRefObject, ReactElement, RefObject } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import type { Post } from '../../../graphql/posts';

export type ReaderContextValue = {
  post: Post;
  isRailOpen: boolean;
  setRailOpen: (open: boolean) => void;
  toggleRail: () => void;
  railWidthPx: number;
  setRailWidthPx: (width: number) => void;
  focusCommentRef: MutableRefObject<() => void>;
  articleScrollRef: RefObject<HTMLDivElement | null>;
  isShortcutHelpOpen: boolean;
  setShortcutHelpOpen: (open: boolean) => void;
  toggleShortcutHelp: () => void;
};

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderContextProvider({
  children,
  value,
}: {
  children: ReactElement;
  value: ReaderContextValue;
}): ReactElement {
  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}

export function useReaderContext(): ReaderContextValue {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error(
      'useReaderContext must be used within ReaderContextProvider',
    );
  }
  return ctx;
}

export function useOptionalReaderContext(): ReaderContextValue | null {
  return useContext(ReaderContext);
}

export function useReaderContextActions(): Pick<
  ReaderContextValue,
  'toggleRail' | 'toggleShortcutHelp'
> & {
  focusCommentComposer: () => void;
} {
  const { toggleRail, toggleShortcutHelp, focusCommentRef } =
    useReaderContext();
  return useMemo(
    () => ({
      toggleRail,
      toggleShortcutHelp,
      focusCommentComposer: () => {
        focusCommentRef.current();
      },
    }),
    [toggleRail, toggleShortcutHelp, focusCommentRef],
  );
}
