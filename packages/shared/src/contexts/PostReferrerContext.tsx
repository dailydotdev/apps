import { createContextProvider } from '@kickass-coderz/react';
import { useRouter } from 'next/router';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Post } from '../graphql/posts';
import type { Origin } from '../lib/log';
import { safeContextHookExport } from '../lib/func';
import { usePrevious } from '../hooks';

type ReferredPost = {
  id: Post['id'];
  author?: Pick<Post['author'], 'id'>;
  origin?: Origin;
};

type UsePostReferrer = (props: { post?: ReferredPost }) => void;

type PostReferrerContext = {
  referrerPost?: ReferredPost;
  setReferrerPost: Dispatch<SetStateAction<ReferredPost | undefined>>;
  usePostReferrer: UsePostReferrer;
};

const [PostReferrerContextProvider, usePostReferrerContextHook] =
  createContextProvider(
    (): PostReferrerContext => {
      const [referrerPost, setReferrerPost] =
        useState<PostReferrerContext['referrerPost']>();
      const router = useRouter();
      const currentPathname = router?.asPath || router?.pathname;
      const previousPathname = usePrevious(currentPathname);

      const isLastPagePost = !!previousPathname?.startsWith('/posts/');

      useEffect(() => {
        if (!isLastPagePost) {
          setReferrerPost(undefined);
        }
      }, [isLastPagePost]);

      return {
        referrerPost,
        setReferrerPost: useCallback(
          (post) => {
            return setReferrerPost(post);
          },
          [setReferrerPost],
        ),
        usePostReferrer: useCallback(({ post }) => {
          useEffect(() => {
            if (!post) {
              return;
            }

            setReferrerPost(post);
          }, [post]);
        }, []),
      };
    },
    {
      errorMessage: 'ContextNotFound',
    },
  );

const usePostReferrerContext = safeContextHookExport(
  usePostReferrerContextHook,
  'ContextNotFound',
  {
    referrerPost: undefined,
    setReferrerPost: () => {},
    usePostReferrer: () => {},
  },
);

export { PostReferrerContextProvider, usePostReferrerContext };
