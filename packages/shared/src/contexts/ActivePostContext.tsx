import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import type { Post } from '../graphql/posts';
import type { Origin } from '../lib/log';
import { safeContextHookExport } from '../lib/func';

export type PostReferrerContextProps = {
  post?: Post;
  children?: ReactNode;
};

export type OpenCommentHandler = (origin: Origin) => void;

export type PostReferrerContext = {
  activePost?: Post;
  requestOpenComment?: OpenCommentHandler;
  onOpenCommentRequest?: (handler: OpenCommentHandler) => () => void;
};

const [ActivePostContextProvider, useActivePostContextHook] =
  createContextProvider(
    ({ post }: PostReferrerContextProps): PostReferrerContext => {
      const openCommentHandlers = useRef(new Set<OpenCommentHandler>());

      return useMemo(() => {
        return {
          activePost: post,
          requestOpenComment: (origin) =>
            openCommentHandlers.current.forEach((handler) => handler(origin)),
          onOpenCommentRequest: (handler) => {
            openCommentHandlers.current.add(handler);
            return () => {
              openCommentHandlers.current.delete(handler);
            };
          },
        };
      }, [post]);
    },
    {
      errorMessage: 'ContextNotFound',
    },
  );

const useActivePostContext = safeContextHookExport(
  useActivePostContextHook,
  'ContextNotFound',
  {},
);

export { ActivePostContextProvider, useActivePostContext };
