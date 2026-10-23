import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { graphql, HttpResponse } from 'msw';
import { POST_CONTENT_MAP } from '@dailydotdev/shared/src/components/post/postContentMap';
import { PostPageFeed } from '@dailydotdev/shared/src/components/post/feed/PostPageFeed';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import ExtensionProviders from '../extension/_providers';
import { Device } from '../history/device';
import postPages from '../history/postPages.json';

/**
 * `post_page_feed` as it ships: production's PostContent with the
 * production PostPageFeed in its `belowComments` slot, as
 * pages/posts/[id] passes it when the flag is on for a signed-in reader.
 * The feed's queries are answered here from real public posts (the
 * History review's set): For you pages forever, a tag or a source runs out.
 * The design review, every case and the implementation guide are in
 * `Experiments / Post page feed` (PR 7015).
 */

const posts = Object.values(postPages as unknown as Record<string, Post>);
const host = posts.find((post) => post.id === 'mGfmauFls') as Post;

const page = <T,>(
  list: T[],
  variables: { first?: number; after?: string },
  node: (item: T, index: number) => unknown,
) => {
  const first = variables.first ?? 7;
  const start = variables.after ? Number(variables.after) : 0;
  return {
    pageInfo: {
      hasNextPage: start + first < list.length,
      endCursor: String(start + first),
    },
    edges: list
      .slice(start, start + first)
      .map((item, index) => ({ node: node(item, start + index) })),
  };
};

const others = posts.filter((post) => post.id !== host.id);

/** For you: the reader's feed never ends, so it cycles the posts. */
const forYou = Array.from({ length: 300 }, (_, index) => {
  const post = others[index % others.length];
  const round = Math.floor(index / others.length);
  return round ? { ...post, id: `${post.id}-${round}` } : post;
});

const handlers = [
  graphql.query('FeedV2', ({ variables }) =>
    HttpResponse.json({
      data: {
        page: page(forYou, variables, (post) => ({
          __typename: 'FeedPostItem',
          feedMeta: null,
          post,
        })),
      },
    }),
  ),
  graphql.query('TagFeed', ({ variables }) =>
    HttpResponse.json({
      data: {
        page: page(
          posts.filter((post) => post.tags?.includes(variables.tag)),
          variables,
          (post) => post,
        ),
      },
    }),
  ),
  graphql.query('SourceFeed', ({ variables }) =>
    HttpResponse.json({
      data: {
        page: page(
          posts.filter((post) => post.source?.id === variables.source),
          variables,
          (post) => post,
        ),
      },
    }),
  ),
  graphql.query('PostComments', () =>
    HttpResponse.json({
      data: {
        postComments: { pageInfo: { hasNextPage: false }, edges: [] },
      },
    }),
  ),
];

/** Opens the frame at the end of the post, where the feed starts. */
const StartAtFeed = (): ReactElement => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const align = () => {
      const feed = view.document.querySelector('[data-testid="postPageFeed"]');
      if (feed) {
        view.scrollTo({
          top: feed.getBoundingClientRect().top + view.scrollY - 160,
          behavior: 'instant',
        });
      }
    };
    const timers = [600, 1500, 3000].map((ms) => view.setTimeout(align, ms));
    return () => timers.forEach((timer) => view.clearTimeout(timer));
  }, []);
  return <span ref={ref} hidden />;
};

/** pages/posts/[id]'s content component for the post's type. */
const PostPage = ({ post = host }: { post?: Post }): ReactElement => {
  const Content = POST_CONTENT_MAP[post.type];
  return (
    <ExtensionProviders>
      <StartAtFeed />
      <div className="min-h-screen bg-background-default text-text-primary antialiased">
        <ActivePostContextProvider post={post}>
          <Content
            post={post}
            isPostPage
            origin={Origin.ArticlePage}
            belowComments={<PostPageFeed post={post} />}
            className={{
              container: '!mt-0 max-w-[69.25rem]',
              fixedNavigation: { container: 'flex laptop:hidden' },
              navigation: {
                container: 'flex tablet:hidden',
                actions: 'flex-1 justify-between',
              },
            }}
          />
        </ActivePostContextProvider>
      </div>
    </ExtensionProviders>
  );
};

const SIZES = [
  { width: 375, height: 812, label: 'Phone · 375' },
  { width: 768, height: 1024, label: 'Tablet · 768' },
  {
    width: 1024,
    height: 800,
    label: 'Laptop · 1024 (narrow column: cards stacked)',
  },
  { width: 1440, height: 900, label: 'Laptop L · 1440' },
  { width: 2560, height: 1300, label: 'Widest · 2560' },
];

const meta: Meta = {
  title: 'Experiments/Post page feed (production)',
  parameters: { layout: 'fullscreen', msw: { handlers } },
  globals: { theme: 'dark' },
};

export default meta;

export const AllWidths: StoryObj = {
  name: 'Every width',
  render: () => (
    <div className="flex flex-col gap-10 bg-background-default p-8">
      {SIZES.map((size) => (
        <Device
          key={size.width}
          width={size.width}
          height={size.height}
          label={size.label}
          fit={size.width > 1000}
        >
          <PostPage />
        </Device>
      ))}
    </div>
  ),
};

export const PostTypes: StoryObj = {
  name: 'Post types',
  render: () => (
    <div className="flex flex-wrap gap-8 bg-background-default p-8">
      {['article', 'video:youtube', 'share', 'freeform', 'collection']
        .map((type) => posts.find((post) => post.type === type))
        .filter((post): post is Post => !!post)
        .map((post) => (
          <Device
            key={post.id}
            width={375}
            height={812}
            label={post.type}
            fit={false}
          >
            <PostPage post={post} />
          </Device>
        ))}
    </div>
  ),
};
