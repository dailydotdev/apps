import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { Post } from '../graphql/posts';
import { safeContextHookExport } from '../lib/func';

export type PostReferrerContextProps = {
  post?: Post;
  children?: ReactNode;
};

export type PostReferrerContext = {
  activePost?: Post;
};

const [ActivePostContextProvider, useActivePostContextHook] =
  createContextProvider(
    ({ post }: PostReferrerContextProps): PostReferrerContext => {
      return useMemo(() => {
        return {
          activePost: post,
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
