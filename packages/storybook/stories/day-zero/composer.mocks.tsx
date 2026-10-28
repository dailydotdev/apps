import React from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { WriteCommentContext } from '@dailydotdev/shared/src/contexts/WriteCommentContext';

export const post = {
  id: 'post-1',
  title: 'Example Post Title',
  author: { id: 'author-1', username: 'ido' },
  source: { id: 'source-1', handle: 'webdev', type: SourceType.Squad },
} as unknown as Post;

export const WriteComment: FC<PropsWithChildren> = ({ children }) => (
  <WriteCommentContext.Provider
    value={{
      mutateComment: {
        mutateComment: async () => null,
        isLoading: false,
        isSuccess: false,
      } as never,
    }}
  >
    {children}
  </WriteCommentContext.Provider>
);
