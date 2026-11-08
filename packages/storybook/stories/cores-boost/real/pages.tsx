import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, http, HttpResponse } from 'msw';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { POST_CONTENT_MAP } from '@dailydotdev/shared/src/components/post/postContentMap';
import ArticlePostModal from '@dailydotdev/shared/src/components/modals/ArticlePostModal';
import { PostPosition } from '@dailydotdev/shared/src/hooks/usePostModalNavigation';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Notification } from '@dailydotdev/shared/src/graphql/notifications';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import { QuestStatus } from '@dailydotdev/shared/src/graphql/quests';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { useQueryClient } from '@tanstack/react-query';
import MainFeedPage from '../../../../webapp/components/layouts/MainFeedPage';
import DailyQuestsPageComponent from '../../../../webapp/pages/daily-quests';
import NotificationsPageComponent from '../../../../webapp/pages/notifications';
import {
  DEFAULT_PICKED_TAGS,
  getPreviewPosts,
} from '../../components/onboarding/feed-preview/previewData';
import { heroAd } from '../../features/feed/feedHero.mocks';
import postPages from '../../history/postPages.json';
import { useRoute, viewer } from './providers';

// Real production pages the Cores and boost moments happen on, mounted inside
// CoresProviders' production MainLayout, with real posts behind them.

const noop = (): void => undefined;

/** This week's real posts, as the home feed's query returns them */
export const feedPosts = getPreviewPosts(DEFAULT_PICKED_TAGS).map(
  ({ post }) => post,
);

const page = <T,>(edges: T[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges,
});

/** The home feed's queries and its ad slot, answered with real posts */
export const homeFeedHandlers = [
  graphql.query('FeedV2', () =>
    HttpResponse.json({
      data: {
        page: page(
          feedPosts.map((post) => ({
            node: { __typename: 'FeedPostItem', feedMeta: null, post },
          })),
        ),
      },
    }),
  ),
  graphql.query(/^(Anonymous)?Feed$/, () =>
    HttpResponse.json({
      data: { page: page(feedPosts.map((node) => ({ node }))) },
    }),
  ),
  http.get(/\/v1\/a(\?.*)?$/, () => HttpResponse.json([heroAd])),
];

/** The webapp home page: MainFeedPage in FeedLayout, as pages/index.tsx */
export const HomeFeedPage = (): ReactElement => {
  useRoute('/');
  return (
    <FeedLayoutProvider>
      <MainFeedPage />
    </FeedLayoutProvider>
  );
};

// A real article as POST_BY_ID_QUERY returned it from api.daily.dev, the base
// for the stories' own posts (same shape, different title and author).
const baseArticle = (postPages as unknown as Record<string, Post>).tbbNjYj52;

const authorOf = (user: {
  id: string;
  name: string;
  username: string;
  image: string;
  permalink: string;
}) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  image: user.image,
  permalink: user.permalink,
});

export const realArticle = (overrides: Partial<Post>): Post =>
  ({
    ...baseArticle,
    numAwards: 0,
    numComments: 0,
    numUpvotes: 0,
    numReposts: 0,
    featuredAward: null,
    userState: undefined,
    ...overrides,
  }) as Post;

/** Dana's own article: the post the award lands on and the nudge shows on */
export const bunPost = realArticle({
  id: 'sb-bun-post',
  title: 'Why we moved to Bun',
  titleHtml: undefined,
  image: cloudinaryPostImageCoverPlaceholder,
  summary:
    'Our API went from Node 20 to Bun in six weeks. Cold starts dropped by two thirds, the test suite runs four times faster, and we deleted most of our build tooling. Here is what broke along the way and what we would do differently.',
  tags: ['bun', 'nodejs', 'javascript', 'performance'],
  createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  numUpvotes: 54,
  numComments: 7,
  author: authorOf(viewer as never),
  permalink: 'https://app.daily.dev/posts/sb-bun-post',
  commentsPermalink: 'https://app.daily.dev/posts/sb-bun-post',
} as Partial<Post>);

/** One of the stories' own posts as a real article by the viewer */
export const ownArticle = (post: Post, isNew: boolean): Post =>
  realArticle({
    id: post.id,
    title: post.title,
    titleHtml: undefined,
    image: post.image ?? cloudinaryPostImageCoverPlaceholder,
    summary:
      'Remote caching took our CI from 22 minutes to under 11 across the monorepo. How we set up the cache, what we stopped rebuilding, and the two places it fought us.',
    tags: post.tags?.length ? post.tags : ['ci', 'devops', 'monorepo'],
    createdAt: new Date(
      Date.now() - (isNew ? 2 : 26 * 60) * 60 * 1000,
    ).toISOString(),
    numUpvotes: isNew ? 0 : 54,
    numComments: isNew ? 0 : 6,
    author: authorOf(viewer as never),
    permalink: `https://app.daily.dev/posts/${post.id}`,
    commentsPermalink: `https://app.daily.dev/posts/${post.id}`,
  } as Partial<Post>);

/** Sam Rivera's article, the post an award is given on */
export const samPost = realArticle({
  numUpvotes: 85,
  numComments: 12,
  author: authorOf({
    id: 'sb-sam',
    name: 'Sam Rivera',
    username: 'samrivera',
    image: viewer.image,
    permalink: 'https://app.daily.dev/samrivera',
  }),
} as Partial<Post>);

/** What a post page asks for besides the post itself */
export const postPageHandlers = [
  graphql.query('PostComments', () =>
    HttpResponse.json({ data: { postComments: page([]) } }),
  ),
  graphql.query(/^(RelatedPosts|FurtherReading|PostCodeSnippets)$/, () =>
    HttpResponse.json({ data: {} }),
  ),
];

/** The post as its page query cached it, which the header's Boost waits on */
const useSeedPost = (post: Post): void => {
  const client = useQueryClient();
  useState(() => client.setQueryData(getPostByIdKey(post.id), { post }));
};

/**
 * Puts `banner` into the post page where production renders the boost strip:
 * after the post's header row, above its title.
 */
const BannerSlot = ({
  host,
  banner,
}: {
  host: HTMLElement | null;
  banner?: ReactNode;
}): ReactElement | null => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!host || !banner) {
      return undefined;
    }
    let element: HTMLElement | null = null;
    const place = () => {
      const title = host.querySelector('h1');
      if (!title || element?.isConnected) {
        return;
      }
      element = document.createElement('div');
      element.className = 'mb-4';
      title.before(element);
      setSlot(element);
    };
    place();
    const observer = new MutationObserver(place);
    observer.observe(host, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      element?.remove();
    };
  }, [host, banner]);

  return slot && banner ? createPortal(banner, slot) : null;
};

/** The webapp post page (pages/posts/[id]), with an optional boost strip */
export const PostPage = ({
  post,
  banner,
  children,
}: {
  post: Post;
  /** Rendered where production puts the boost strip */
  banner?: ReactNode;
  /** Modals or popups over the page */
  children?: ReactNode;
}): ReactElement => {
  useSeedPost(post);
  useRoute(`/posts/${post.id}`);
  const Content = POST_CONTENT_MAP[post.type] ?? POST_CONTENT_MAP.article;
  const host = useRef<HTMLDivElement>(null);
  const [hostElement, setHostElement] = useState<HTMLElement | null>(null);
  useEffect(() => setHostElement(host.current), []);

  return (
    <div ref={host} className="contents">
      <ActivePostContextProvider post={post}>
        <Content
          isPostPage
          post={post}
          origin={Origin.ArticlePage}
          className={{
            container:
              'mb-16 min-h-page max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
            fixedNavigation: { container: 'flex laptop:hidden' },
            navigation: {
              container: 'flex tablet:hidden',
              actions: 'flex-1 justify-between',
            },
          }}
        />
      </ActivePostContextProvider>
      <BannerSlot host={hostElement} banner={banner} />
      {children}
    </div>
  );
};

/** A post opened from the home feed: the real post modal over the feed */
export const PostModalOverFeed = ({
  post,
  children,
}: {
  post: Post;
  children?: ReactNode;
}): ReactElement => {
  useSeedPost(post);
  return (
    <>
      <HomeFeedPage />
      {post.type === PostType.Article && (
        <ArticlePostModal
          id={post.id}
          isOpen
          post={post}
          onRequestClose={noop}
          onPreviousPost={noop}
          onNextPost={noop}
          postPosition={PostPosition.Middle}
        />
      )}
      {children}
    </>
  );
};

/** The webapp daily quests page (pages/daily-quests) */
export const DailyQuestsPage = (): ReactElement => <DailyQuestsPageComponent />;

/** The webapp notifications page (pages/notifications) */
export const NotificationsPage = (): ReactElement => {
  useRoute('/notifications');
  return <NotificationsPageComponent />;
};

export const notificationsHandlers = (notifications: Notification[]) => [
  graphql.mutation('ReadNotifications', () =>
    HttpResponse.json({ data: { readNotifications: { _: true } } }),
  ),
  graphql.query('Notifications', () =>
    HttpResponse.json({
      data: {
        notifications: page(notifications.map((node) => ({ node }))),
      },
    }),
  ),
];

/** Fired when a story's quest is claimed, from the sidebar or the page */
export const QUEST_CLAIMED_EVENT = 'sb-quest-claimed';

/**
 * The quest dashboard with one daily quest. Claiming it marks it claimed, as
 * production's ClaimQuestReward answers.
 */
export const questHandlers = (quest: UserQuest, isClaimed = false) => {
  let claimed = isClaimed;
  const current = (): UserQuest =>
    claimed
      ? {
          ...quest,
          status: QuestStatus.Claimed,
          claimable: false,
          claimedAt: new Date(),
        }
      : quest;
  const buckets = () => ({
    level: { level: 4, totalXp: 1230, xpInLevel: 230, xpToNextLevel: 400 },
    daily: { regular: [current()], plus: [] },
    weekly: { regular: [], plus: [] },
    milestone: [],
    intro: [],
  });

  return [
    graphql.query('QuestDashboard', () =>
      HttpResponse.json({
        data: {
          questDashboard: {
            ...buckets(),
            currentStreak: 3,
            longestStreak: 12,
          },
        },
      }),
    ),
    graphql.mutation('ClaimQuestReward', () => {
      claimed = true;
      window.dispatchEvent(new Event(QUEST_CLAIMED_EVENT));
      return HttpResponse.json({ data: { claimQuestReward: buckets() } });
    }),
  ];
};

/**
 * Draws `children` in place of the first element of the real page that
 * `find` returns, hiding that element: a story's own version of one row or
 * strip, inside the production page around it.
 */
export const SwapInPage = ({
  find,
  children,
}: {
  find: () => HTMLElement | null;
  children: ReactNode;
}): ReactElement | null => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element: HTMLElement | null = null;
    let target: HTMLElement | null = null;
    const place = () => {
      if (element?.isConnected) {
        return;
      }
      target = find();
      if (!target) {
        return;
      }
      element = document.createElement('div');
      target.before(element);
      target.style.display = 'none';
      setSlot(element);
    };
    place();
    const observer = new MutationObserver(place);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      element?.remove();
      if (target) {
        target.style.display = '';
      }
    };
    // `find` is a fixed lookup per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return slot ? createPortal(children, slot) : null;
};

/** The production notification row whose text includes `text` */
export const findNotificationRow = (text: string) => (): HTMLElement | null =>
  [...document.querySelectorAll<HTMLElement>('div.min-h-14.py-3')].find((row) =>
    row.textContent?.includes(text),
  ) ?? null;

const viewerAvatar = {
  type: 'user',
  image: viewer.image,
  name: viewer.name,
  targetUrl: viewer.permalink,
  referenceId: viewer.id,
};

/**
 * The boost notifications as production sends them today
 * (generateCampaignPostNotification): DailyDev icon, your avatar, a title
 * only, plus an older reply so the page isn't a single row.
 */
export const boostNotifications = (): Notification[] =>
  [
    {
      id: 'sb-boost-completed',
      type: 'campaign_post_completed',
      icon: 'DailyDev',
      title: '<p>Your post boost has ended</p>',
      avatars: [viewerAvatar],
      attachments: [],
      referenceId: 'sb-campaign-ended',
      targetUrl: '/boosts',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 'sb-boost-milestone',
      type: 'campaign_post_first_milestone',
      icon: 'DailyDev',
      title: "<p>Your post boost is 70% done. See how it's performing</p>",
      avatars: [viewerAvatar],
      attachments: [],
      referenceId: 'sb-campaign-live',
      targetUrl: '/boosts',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 'sb-boost-reply',
      type: 'comment_reply',
      icon: 'Comment',
      title: '<p><b>Noa Levi</b> replied to your comment</p>',
      description: 'Same here, the cache hit rate was the whole story for us.',
      avatars: [{ ...viewerAvatar, name: 'Noa Levi', referenceId: 'sb-noa' }],
      attachments: [],
      referenceId: 'sb-reply',
      targetUrl: '/',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
  ] as unknown as Notification[];
