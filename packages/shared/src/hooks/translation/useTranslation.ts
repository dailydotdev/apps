import { useCallback, useEffect, useRef } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { stream } from 'fetch-event-stream';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import type { FeedData } from '../../graphql/posts';
import { updateCachedPagePost, findIndexOfPostInData } from '../../lib/query';

export enum ServerEvents {
  Connect = 'connect',
  Message = 'message',
  Disconnect = 'disconnect',
  Error = 'error',
}

type UseTranslation = (props: {
  queryKey: QueryKey;
  queryType: 'post' | 'feed';
}) => {
  fetchTranslations: (id: string[]) => void;
};

type TranslateEvent = {
  id: string;
  title: string;
};

export const useTranslation: UseTranslation = ({ queryKey, queryType }) => {
  const abort = useRef<AbortController>();
  const { user, accessToken, isLoggedIn } = useAuthContext();
  const queryClient = useQueryClient();

  const { language } = user;

  const updateFeed = useCallback(
    (post: TranslateEvent) => {
      const updatePost = updateCachedPagePost(queryKey, queryClient);
      const feedData =
        queryClient.getQueryData<InfiniteData<FeedData>>(queryKey);
      const { pageIndex, index } = findIndexOfPostInData(
        feedData,
        post.id,
        true,
      );
      if (index > -1) {
        const updatedPost = feedData.pages[pageIndex].page.edges[index].node;
        if (updatedPost.title) {
          updatedPost.title = post.title;
          updatedPost.translation = { title: !!post.title };
        } else {
          updatedPost.sharedPost.title = post.title;
          updatedPost.sharedPost.translation = {
            title: !!post.title,
          };
        }

        updatePost(pageIndex, index, updatedPost);
      }
    },
    [queryKey, queryClient],
  );

  const fetchTranslations = useCallback(
    async (postIds: string[]) => {
      if (!isLoggedIn || !language) {
        return;
      }
      if (postIds.length === 0) {
        return;
      }

      const params = new URLSearchParams();
      postIds.forEach((id) => {
        params.append('id', id);
      });

      const messages = await stream(
        `${apiUrl}/translate/post/title?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken?.token}`,
            'Content-Language': language as string,
          },
        },
      );

      // eslint-disable-next-line no-restricted-syntax
      for await (const message of messages) {
        if (message.event === ServerEvents.Message) {
          const post = JSON.parse(message.data) as TranslateEvent;
          if (queryType === 'feed') {
            updateFeed(post);
          }
        }
      }
    },
    [accessToken?.token, isLoggedIn, language, queryType, updateFeed],
  );

  useEffect(() => {
    abort.current = new AbortController();

    return () => {
      abort.current?.abort();
    };
  }, []);

  return { fetchTranslations };
};
