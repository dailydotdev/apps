import { useCallback, useEffect, useRef } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { events } from 'fetch-event-stream';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import type { FeedData, Post } from '../../graphql/posts';
import {
  updateCachedPagePost,
  findIndexOfPostInData,
  updatePostCache,
} from '../../lib/query';
import { useSettingsContext } from '../../contexts/SettingsContext';

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
  fetchTranslations: (id: Post[]) => void;
};

type TranslateEvent = {
  id: string;
  title: string;
};

const updateTranslation = (post: Post, translation: TranslateEvent): Post => {
  const updatedPost = post;
  if (post.title) {
    updatedPost.title = translation.title;
    updatedPost.translation = { title: !!translation.title };
  } else {
    updatedPost.sharedPost.title = translation.title;
    updatedPost.sharedPost.translation = { title: !!translation.title };
  }

  return updatedPost;
};

export const useTranslation: UseTranslation = ({ queryKey, queryType }) => {
  const abort = useRef<AbortController>();
  const { user, accessToken, isLoggedIn } = useAuthContext();
  const { flags } = useSettingsContext();
  const queryClient = useQueryClient();

  const { language } = user || {};
  const isStreamActive = isLoggedIn && !!language;

  const updateFeed = useCallback(
    (translatedPost: TranslateEvent) => {
      const updatePost = updateCachedPagePost(queryKey, queryClient);
      const feedData =
        queryClient.getQueryData<InfiniteData<FeedData>>(queryKey);
      const { pageIndex, index } = findIndexOfPostInData(
        feedData,
        translatedPost.id,
        true,
      );
      if (index > -1) {
        updatePost(
          pageIndex,
          index,
          updateTranslation(
            feedData.pages[pageIndex].page.edges[index].node,
            translatedPost,
          ),
        );
      }
    },
    [queryKey, queryClient],
  );

  const updatePost = useCallback(
    (translatedPost: TranslateEvent) => {
      updatePostCache(queryClient, translatedPost.id, (post) =>
        updateTranslation(post, translatedPost),
      );
    },
    [queryClient],
  );

  const fetchTranslations = useCallback(
    async (posts: Post[]) => {
      if (!isStreamActive) {
        return;
      }
      if (posts.length === 0) {
        return;
      }

      const postIds = posts
        .filter((node) =>
          node?.title
            ? !node?.translation?.title
            : !node?.sharedPost?.translation?.title,
        )
        .filter((node) =>
          flags?.clickbaitShieldEnabled && node?.title
            ? !node.clickbaitTitleDetected
            : !node.sharedPost?.clickbaitTitleDetected,
        )
        .filter(Boolean)
        .map((node) => (node?.title ? node.id : node?.sharedPost.id));

      if (postIds.length === 0) {
        return;
      }

      const params = new URLSearchParams();
      postIds.forEach((id) => {
        params.append('id', id);
      });

      const response = await fetch(`${apiUrl}/translate/post/title?${params}`, {
        signal: abort.current?.signal,
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken?.token}`,
          'Content-Language': language as string,
        },
      });

      if (!response.ok) {
        return;
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const message of events(response)) {
        if (message.event === ServerEvents.Message) {
          const post = JSON.parse(message.data) as TranslateEvent;
          if (queryType === 'feed') {
            updateFeed(post);
          } else {
            updatePost(post);
          }
        }
      }
    },
    [
      accessToken?.token,
      flags?.clickbaitShieldEnabled,
      isStreamActive,
      language,
      queryType,
      updateFeed,
      updatePost,
    ],
  );

  useEffect(() => {
    abort.current = new AbortController();

    return () => {
      abort.current?.abort();
    };
  }, []);

  return { fetchTranslations };
};
