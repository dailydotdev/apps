import { useCallback, useEffect, useRef } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { events } from 'fetch-event-stream';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import type { FeedData, Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
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
  clickbaitShieldEnabled?: boolean;
}) => {
  fetchTranslations: (id: Post[]) => Promise<TranslateEvent[]>;
};

type TranslateFields = 'title' | 'smartTitle';

type TranslateEvent = {
  id: string;
  field: TranslateFields;
  value: string;
};

type TranslatePayload = Record<string, TranslateFields[]>;

const updateTitleTranslation = ({
  post,
  translation,
}: {
  post: Post;
  translation: TranslateEvent;
}): void => {
  const updatedPost = post;

  if (post.title) {
    updatedPost.title = translation.value;
    updatedPost.translation = { title: !!translation.value };
  } else {
    updatedPost.sharedPost.title = translation.value;
    updatedPost.sharedPost.translation = { title: !!translation.value };
  }
};

const updateTranslation = ({
  post,
  translation,
  clickbaitShieldEnabled,
}: {
  post: Post;
  translation: TranslateEvent;
  clickbaitShieldEnabled: boolean;
}): Post => {
  const updatedPost = post;

  const shouldUseSmartTitle =
    post.clickbaitTitleDetected && clickbaitShieldEnabled;

  switch (translation.field) {
    case 'title':
      if (shouldUseSmartTitle) {
        break;
      }

      updateTitleTranslation({ post, translation });

      break;
    case 'smartTitle':
      if (!shouldUseSmartTitle) {
        break;
      }

      updateTitleTranslation({ post, translation });

      break;
    default:
      break;
  }

  return updatedPost;
};

export const useTranslation: UseTranslation = ({
  queryKey,
  queryType,
  clickbaitShieldEnabled: clickbaitShieldEnabledProp,
}) => {
  const abort = useRef<AbortController>();
  const { user, accessToken, isLoggedIn } = useAuthContext();
  const { flags } = useSettingsContext();
  const queryClient = useQueryClient();
  const clickbaitShieldEnabled = !!(
    clickbaitShieldEnabledProp ?? flags?.clickbaitShieldEnabled
  );

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
          updateTranslation({
            post: feedData.pages[pageIndex].page.edges[index].node,
            translation: translatedPost,
            clickbaitShieldEnabled,
          }),
        );
      }
    },
    [queryKey, queryClient, clickbaitShieldEnabled],
  );

  const updatePost = useCallback(
    (translatedPost: TranslateEvent) => {
      updatePostCache(queryClient, translatedPost.id, (post) =>
        updateTranslation({
          post,
          translation: translatedPost,
          clickbaitShieldEnabled,
        }),
      );
    },
    [queryClient, clickbaitShieldEnabled],
  );

  const fetchTranslations = useCallback(
    async (posts: Post[]) => {
      if (!isStreamActive) {
        return [];
      }
      if (posts.length === 0) {
        return [];
      }

      const postsToTranslate = posts
        .filter(
          (post) =>
            !(
              [PostType.Article, PostType.VideoYouTube].includes(post.type) &&
              post.language === language
            ),
        )
        .filter(Boolean)
        .map((node) => (node?.title ? node : node?.sharedPost));

      if (postsToTranslate.length === 0) {
        return [];
      }

      const payload = postsToTranslate.reduce((acc, post) => {
        const fields = [];

        const shouldUseSmartTitle =
          post.clickbaitTitleDetected && clickbaitShieldEnabled;

        if (shouldUseSmartTitle && !post.translation?.smartTitle) {
          fields.push('smartTitle');
        }

        if (!shouldUseSmartTitle && !post.translation?.title) {
          fields.push('title');
        }

        if (fields.length > 0) {
          acc[post.id] = fields;
        }

        return acc;
      }, {} as TranslatePayload);

      if (Object.keys(payload).length === 0) {
        return [];
      }

      const response = await fetch(`${apiUrl}/translate/post`, {
        signal: abort.current?.signal,
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken?.token}`,
          'Content-Language': language as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return [];
      }

      const results: TranslateEvent[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for await (const message of events(response)) {
        if (message.event === ServerEvents.Message) {
          const post = JSON.parse(message.data) as TranslateEvent;

          results.push(post);

          if (queryType === 'feed') {
            updateFeed(post);
          } else {
            updatePost(post);
          }
        }
      }

      return results;
    },
    [
      accessToken?.token,
      isStreamActive,
      language,
      queryType,
      updateFeed,
      updatePost,
      clickbaitShieldEnabled,
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
