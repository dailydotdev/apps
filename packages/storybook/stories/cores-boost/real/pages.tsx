import type { ReactElement } from 'react';
import React from 'react';
import { graphql, http, HttpResponse } from 'msw';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Notification } from '@dailydotdev/shared/src/graphql/notifications';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import { QuestStatus } from '@dailydotdev/shared/src/graphql/quests';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
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

/** What a post page asks for besides the post itself */
export const postPageHandlers = [
  graphql.query('PostComments', () =>
    HttpResponse.json({ data: { postComments: page([]) } }),
  ),
  graphql.query(/^(RelatedPosts|FurtherReading|PostCodeSnippets)$/, () =>
    HttpResponse.json({ data: {} }),
  ),
];

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
