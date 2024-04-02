import { createContext, useContext } from 'react';
import { UseMutateCommentResult } from '../hooks/post/useMutateComment';

interface WriteCommentContextProp {
  mutateCommentResult: UseMutateCommentResult;
}

export const WriteCommentContext = createContext<WriteCommentContextProp>({
  mutateCommentResult: null,
});

export const useWriteCommentContext = (): WriteCommentContextProp =>
  useContext(WriteCommentContext);
