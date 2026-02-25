import { useCallback, useEffect, useRef } from 'react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { events } from 'fetch-event-stream';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import type {
  FeedData,
  Post,
  TranslateablePostField,
} from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import {
  updateCachedPagePost,
  findIndexOfPostInData,
  updatePostCache,
} from '../../lib/query';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription } from '../usePlusSubscription';
import { isExtension } from '../../lib/func';

export enum ServerEvents {
  Connect = 'connect',
  Message = 'message',
  Disconnect = 'disconnect',
  Error = 'error',
}

type UseTranslation = (props: {
  queryKey?: QueryKey;
  queryType?: 'post' | 'feed';
  clickbaitShieldEnabled?: boolean;
}) => {
  fetchTranslations: (id: Post[]) => Promise<TranslateEvent[]>;
};

type TranslateEvent = {
  id: string;
  field: TranslateablePostField;
  value: string;
};

type TranslatePayload = Record<string, TranslateablePostField[]>;

type UpdateCachedPostTranslations = ({
  post,
  translation,
}: {
  post: Post;
  translation: TranslateEvent;
}) => Post;

const updateGenericPostField: UpdateCachedPostTranslations = ({
  post,
  translation: genericTranslation,
}) => {
  if (
    genericTranslation.field !== 'summary' &&
    genericTranslation.field !== 'titleHtml'
  ) {
    return post;
  }

  const updatedPost = structuredClone(post);

  updatedPost[genericTranslation.field] = genericTranslation.value;
  updatedPost.translation = {
    ...updatedPost.translation,
    [genericTranslation.field]: !!genericTranslation.value,
  };

  return updatedPost;
};

export const updateTitleTranslation: UpdateCachedPostTranslations = ({
  post,
  translation: titleTranslation,
}) => {
  if (
    titleTranslation.field !== 'title' &&
    titleTranslation.field !== 'smartTitle'
  ) {
    return post;
  }

  const updatedPost = structuredClone(post);

  if (post.title) {
    updatedPost.title = titleTranslation.value;
    updatedPost.translation = {
      ...updatedPost.translation,
      [titleTranslation.field]: !!titleTranslation.value,
    };
  } else {
    if (!updatedPost.sharedPost) {
      return updatedPost;
    }

    updatedPost.sharedPost.title = titleTranslation.value;
    updatedPost.sharedPost.translation = {
      ...updatedPost.translation,
      [titleTranslation.field]: !!titleTranslation.value,
    };
  }

  return updatedPost;
};

const updateTranslation = ({
  post,
  translation,
}: {
  post: Post;
  translation: TranslateEvent;
}): Post => {
  let updatedPost = post;

  switch (translation.field) {
    case 'title':
    case 'smartTitle':
      updatedPost = updateTitleTranslation({
        post,
        translation,
      });
      break;
    case 'summary':
    case 'titleHtml':
      updatedPost = updateGenericPostField({
        post,
        translation,
      });
      break;
    default:
      break;
  }

  return updatedPost;
};

export const useTranslation: UseTranslation = ({
  queryKey,
  queryType = 'post',
  clickbaitShieldEnabled: clickbaitShieldEnabledProp,
}) => {
  const abort = useRef<AbortController>();
  const { user, accessToken, isLoggedIn } = useAuthContext();
  const { flags } = useSettingsContext();
  const queryClient = useQueryClient();
  const clickbaitShieldEnabled = !!(
    clickbaitShieldEnabledProp ?? flags?.clickbaitShieldEnabled
  );
  const { isPlus } = usePlusSubscription();

  const { language } = user || {};
  const isStreamActive = isLoggedIn && isPlus && !!language;

  const updateFeed = useCallback(
    (translatedPost: TranslateEvent) => {
      if (!queryKey) {
        return;
      }

      const updatePost = updateCachedPagePost(queryKey, queryClient);
      const feedData =
        queryClient.getQueryData<InfiniteData<FeedData>>(queryKey);
      if (!feedData) {
        return;
      }

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
          }),
        );
      }
    },
    [queryKey, queryClient],
  );

  const updatePost = useCallback(
    (translatedPost: TranslateEvent) => {
      if (!queryKey) {
        return;
      }

      updatePostCache(queryClient, translatedPost.id, (post) =>
        updateTranslation({
          post,
          translation: translatedPost,
        }),
      );
    },
    [queryClient, queryKey],
  );

  const fetchTranslations = useCallback(
    async (posts: Post[]) => {
      if (!isStreamActive) {
        return [];
      }
      if (posts.length === 0) {
        return [];
      }

      if (!language || !accessToken?.token) {
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
        .map((node) => (node?.title ? node : node?.sharedPost))
        .filter((postItem): postItem is Post => Boolean(postItem));

      if (postsToTranslate.length === 0) {
        return [];
      }

      const payload = postsToTranslate.reduce<TranslatePayload>((acc, post) => {
        const fields: TranslateablePostField[] = [];

        const shouldUseSmartTitle =
          post.clickbaitTitleDetected && clickbaitShieldEnabled;

        if (shouldUseSmartTitle && !post.translation?.smartTitle) {
          fields.push('smartTitle');
        }

        if (!shouldUseSmartTitle && !post.translation?.title) {
          fields.push('title');
        }

        if (post.type === PostType.Share && !post?.translation?.titleHtml) {
          fields.push('titleHtml');
        }

        if (
          queryType !== 'feed' &&
          post.summary &&
          !post.translation?.summary
        ) {
          fields.push('summary');
        }

        if (fields.length > 0) {
          acc[post.id] = fields;
        }

        return acc;
      }, {});

      if (Object.keys(payload).length === 0) {
        return [];
      }

      const requestHeaders = new Headers({
        Accept: 'text/event-stream',
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Language': language,
        'Content-Type': 'application/json',
        'X-Daily-Client': isExtension ? 'extension' : 'webapp',
      });
      if (process.env.CURRENT_VERSION) {
        requestHeaders.set('X-Daily-Version', process.env.CURRENT_VERSION);
      }

      const response = await fetch(`${apiUrl}/translate/post`, {
        signal: abort.current?.signal,
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return [];
      }

      const results: TranslateEvent[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for await (const message of events(response)) {
        if (message.event === ServerEvents.Message && message.data) {
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
