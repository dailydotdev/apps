import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type JustBookmarkedContextValue = {
  justBookmarkedPosts?: string[];
  addPostToJustBookmarked?: (postId: string) => void;
  isPostJustBookmarked?: (postId: string) => boolean;
};

export const JustBookmarkedContext = createContext<JustBookmarkedContextValue>({
  justBookmarkedPosts: [],
  addPostToJustBookmarked: () => {},
  isPostJustBookmarked: () => false,
});

export interface JustBookmarkedContextProviderProps {
  children?: ReactNode;
}

export const JustBookmarkedContextProvider = ({
  children,
}: JustBookmarkedContextProviderProps): ReactElement => {
  const [justBookmarkedPosts, setJustBookmarkedPosts] = useState<string[]>([]);

  const addPostToJustBookmarked = useCallback(
    (postId: string) => {
      setJustBookmarkedPosts((prev) => [...prev, postId]);
    },
    [setJustBookmarkedPosts],
  );

  const isPostJustBookmarked = useCallback(
    (postId: string) => {
      return justBookmarkedPosts.includes(postId);
    },
    [justBookmarkedPosts],
  );

  const justBookmarkedContextValue = useMemo(
    () => ({
      justBookmarkedPosts,
      addPostToJustBookmarked,
      isPostJustBookmarked,
    }),
    [justBookmarkedPosts, addPostToJustBookmarked, isPostJustBookmarked],
  );
  return (
    <JustBookmarkedContext.Provider value={justBookmarkedContextValue}>
      {children}
    </JustBookmarkedContext.Provider>
  );
};

export const useJustBookmarkedContext = (): JustBookmarkedContextValue =>
  useContext(JustBookmarkedContext);
