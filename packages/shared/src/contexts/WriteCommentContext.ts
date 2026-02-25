import { createContext, useContext } from 'react';
import type { UseMutateCommentResult } from '../hooks/post/useMutateComment';

interface WriteCommentContextProp {
  mutateComment: UseMutateCommentResult;
}

export const WriteCommentContext =
  createContext<WriteCommentContextProp | null>(null);

export const useWriteCommentContext = (): WriteCommentContextProp => {
  const context = useContext(WriteCommentContext);

  if (!context) {
    throw new Error(
      'useWriteCommentContext must be used within a WriteCommentContext provider',
    );
  }

  return context;
};
