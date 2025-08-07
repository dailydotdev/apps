import { createContextProvider } from '@kickass-coderz/react';
import { useRouter } from 'next/router';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Post } from '../graphql/posts';
import type { Origin } from '../lib/log';
import { safeContextHookExport } from '../lib/func';

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
      const [navigationCount, setNavigationCount] = useState(0);
      const [referrerPost, setReferrerPost] =
        useState<PostReferrerContext['referrerPost']>();
      const router = useRouter();
      const currentPathname = router?.asPath || router?.pathname;

      useEffect(() => {
        setNavigationCount((prev) => prev + 1);
      }, [currentPathname]);

      useEffect(() => {
        if (navigationCount > 1) {
          setNavigationCount(0);
          setReferrerPost(undefined);
        }
      }, [navigationCount]);

      return {
        referrerPost,
        setReferrerPost: useCallback(
          (post) => {
            setNavigationCount(0);

            return setReferrerPost(post);
          },
          [setReferrerPost],
        ),
        usePostReferrer: useCallback(({ post }) => {
          useEffect(() => {
            if (!post) {
              return;
            }

            setNavigationCount(0);

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
