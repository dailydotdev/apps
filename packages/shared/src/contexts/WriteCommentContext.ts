import { createContext, useContext } from 'react';
import { UseMutateCommentResult } from '../hooks/post/useMutateComment';

interface WriteCommentContextProp {
  mutateComment: UseMutateCommentResult;
}

export const WriteCommentContext = createContext<WriteCommentContextProp>({
  mutateComment: null,
});

export const useWriteCommentContext = (): WriteCommentContextProp =>
  useContext(WriteCommentContext);
