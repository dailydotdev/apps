import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostRelationType } from '@dailydotdev/shared/src/graphql/posts';
import { SortCommentsBy } from '@dailydotdev/shared/src/graphql/comments';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import {
  generateCommentsQueryKey,
  generateQueryKey,
  getPostByIdKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { defaultBootData, getBootMock } from '../../mock/boot';
import {
  allCollectionSources,
  collectionPost,
  collectionSources,
  comments,
  directAd,
  featuredArchives,
  furtherReading,
  squad,
} from './data';

export enum Viewer {
  Anonymous = 'Logged out visitor',
  Member = 'Logged in',
  Plus = 'Plus member',
}

const member = {
  ...defaultBootData.user,
  id: 'u-viewer',
  name: 'Tsahi Matsliah',
  username: 'tsahi',
  image:
    'https://media.daily.dev/image/upload/s--AOhSU9kx--/f_auto/v1785742065/avatars/avatar_gdco5dGLTOCNm55DPuark?_a=BAMAMicg0',
};

const bootUser = {
  [Viewer.Anonymous]: { id: 'anonymous-visitor' },
  [Viewer.Member]: member,
  [Viewer.Plus]: { ...member, isPlus: true, plusMemberSince: new Date() },
};

// `useAdQuery` appends the consent fingerprint to the key it was given, and
// whether GDPR applies depends on the geo, so every fingerprint is seeded.
const consentFingerprints = [
  [undefined, ''],
  [false, ''],
  [true, ''],
];

const seed = (
  client: QueryClient,
  viewer: Viewer,
  posts: Post[],
  commentAd: boolean,
): void => {
  const keyUsers = [bootUser[viewer], undefined];
  const thread = {
    postComments: {
      edges: comments.map((node) => ({ node, cursor: node.id })),
      pageInfo: { hasNextPage: false },
    },
  };
  const reversed = {
    postComments: {
      ...thread.postComments,
      edges: [...thread.postComments.edges].reverse(),
    },
  };

  posts.forEach((post) => {
    client.setQueryData(getPostByIdKey(post.id), { post });
    client.setQueryData(
      generateCommentsQueryKey({
        postId: post.id,
        sortBy: SortCommentsBy.NewestFirst,
      }),
      reversed,
    );
    client.setQueryData(
      generateCommentsQueryKey({
        postId: post.id,
        sortBy: SortCommentsBy.OldestFirst,
      }),
      thread,
    );
    client.setQueryData(['furtherReading', post.id], furtherReading);
    client.setQueryData(
      [RequestKey.FeaturedArchives, post.id],
      featuredArchives,
    );
    if (viewer !== Viewer.Plus) {
      keyUsers.forEach((keyUser) => {
        // Production's comment placement (/v1/a/post) comes back empty,
        // so the thread ad renders nothing unless a story asks for it.
        [
          [
            generateQueryKey(RequestKey.Ads, keyUser, post.id, 'post-sidebar'),
            directAd,
          ],
          [
            generateQueryKey(RequestKey.Ads, keyUser, post.id),
            commentAd ? directAd : null,
          ],
        ].forEach(([key, ad]) =>
          consentFingerprints.forEach((fingerprint) =>
            client.setQueryData([...(key as unknown[]), ...fingerprint], ad),
          ),
        );
      });
    }
  });
  keyUsers.forEach((keyUser) =>
    client.setQueryData(
      generateQueryKey(RequestKey.Squad, keyUser, squad.handle),
      squad,
    ),
  );
  client.setQueryData(
    generateQueryKey(RequestKey.RelatedPosts, undefined, {
      id: collectionPost.id,
      type: PostRelationType.Collection,
    }),
    {
      pages: [
        {
          edges: collectionSources.map((node) => ({ node, cursor: node.id })),
          pageInfo: { hasNextPage: false },
        },
      ],
      pageParams: [''],
    },
  );
  allCollectionSources.forEach((source) =>
    client.setQueryData(
      generateQueryKey(RequestKey.Source, undefined, source.id, 'tooltip'),
      source,
    ),
  );
  // Nobody is followed yet, so every Follow button shows.
  const followable = posts.flatMap((post) => [
    { id: post.source?.id, entity: ContentPreferenceType.Source },
    { id: post.sharedPost?.source?.id, entity: ContentPreferenceType.Source },
    { id: post.author?.id, entity: ContentPreferenceType.User },
  ]);
  followable.forEach(({ id, entity }) => {
    if (id) {
      client.setQueryData(
        generateQueryKey(RequestKey.ContentPreference, bootUser[viewer], {
          id,
          entity,
        }),
        null,
      );
    }
  });
};

interface HybridProvidersProps {
  viewer?: Viewer;
  /** Fill the thread's direct-sold placement, which is empty live. */
  commentAd?: boolean;
  posts: Post[];
  children: ReactNode;
}

/**
 * A booted app per mount: the boot query lives under one global key, so a
 * shared client would serve whichever viewer booted first. Everything the
 * page reads is seeded and never goes stale, so nothing waits on the API.
 */
export const HybridProviders = ({
  viewer = Viewer.Member,
  commentAd = false,
  posts,
  children,
}: HybridProvidersProps): ReactElement => {
  const [bootData] = useState(() => ({
    ...getBootMock(),
    user: bootUser[viewer] as { id: string },
  }));
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
          refetchOnWindowFocus: false,
          refetchInterval: false,
        },
      },
    });
    // Boot refetches through the global mock, which answers as the fixture
    // user; pinning the query keeps this frame's viewer, even beside frames
    // booted as someone else.
    client.setQueryData(BOOT_QUERY_KEY, bootData);
    client.getQueryCache().subscribe(({ query }) => {
      const booted = query.state.data as { user?: { id: string } } | undefined;
      if (
        query.queryHash === JSON.stringify(BOOT_QUERY_KEY) &&
        booted?.user?.id !== bootData.user.id
      ) {
        client.setQueryData(BOOT_QUERY_KEY, bootData);
      }
    });
    seed(client, viewer, posts, commentAd);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="hybrid"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={bootData as never}
      >
        <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
          {children}
        </ActiveFeedContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};
