import React, { useEffect, useState } from 'react';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { graphql, http, HttpResponse } from 'msw';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { ContentPreferenceStatus } from '@dailydotdev/shared/src/graphql/contentPreference';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import { PostType } from '@dailydotdev/shared/src/types';
import { WhyRecommendedContent } from './components/WhyRecommendedContent';
import WhyRecommendedModal from './components/WhyRecommendedModal';
import type { RecommendationExplanation } from './components/whyRecommended';
import {
  RecommendationMatchKind,
  RecommendationMatchOrigin,
  RecommendationMatchRole,
} from './components/whyRecommended';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders from '../../extension/_providers';

/**
 * Storybook harness for "Why am I seeing this?". Each panel mounts its own
 * providers so follow/block state never leaks between variants, and renders
 * the same `WhyRecommendedContent` the production modal wraps.
 */

const avatar = (seed: number): string =>
  `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${seed}`;

const machineSource = (id: string, name: string, image: string): Source =>
  ({
    id,
    handle: id,
    name,
    image,
    permalink: `https://app.daily.dev/sources/${id}`,
    type: SourceType.Machine,
    public: true,
  } as Source);

const squadSource = (isMember: boolean): Source =>
  ({
    id: 'webdev-squad',
    handle: 'webdev',
    name: 'Web Dev Squad',
    image:
      'https://media.daily.dev/image/upload/v1675852969/squads/c0457b66-e89b-4fc0-b06d-48f920c7caa2.jpg',
    permalink: 'https://app.daily.dev/squads/webdev',
    type: SourceType.Squad,
    public: true,
    active: true,
    ...(isMember && {
      currentMember: { role: SourceMemberRole.Member },
    }),
  } as Source);

const userSource = {
  id: 'user-source',
  handle: 'idoshamun',
  name: 'Ido Shamun',
  image: avatar(2),
  permalink: 'https://app.daily.dev/idoshamun',
  type: SourceType.User,
} as Source;

export const makeAuthor = (
  name: string,
  seed: number,
  status?: ContentPreferenceStatus,
): Author =>
  ({
    id: `author-${seed}`,
    name,
    username: name.toLowerCase().replace(/\s/g, ''),
    image: avatar(seed),
    permalink: `https://app.daily.dev/${seed}`,
    ...(status && { contentPreference: { status } }),
  } as Author);

const tds = machineSource(
  'tds',
  'Towards Data Science',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
);
const tkdodo = machineSource(
  'tkdodo',
  'TkDodo',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1656338366/logos/tkdodo',
);

const basePost = (overrides: Partial<Post>): Post => ({
  id: `post-${Math.random().toString(36).slice(2, 9)}`,
  title: 'Building reliable AI agents with MCP',
  image: avatar(6),
  commentsPermalink: 'https://app.daily.dev/posts/why',
  type: PostType.Article,
  source: tds,
  author: makeAuthor('Nimrod Kramer', 1),
  tags: ['genai', 'mcp', 'ai-agents', 'architecture', 'llm'],
  ...overrides,
});

export const posts = {
  article: basePost({}),
  articleNoAuthor: basePost({ author: undefined }),
  articleFollowedAuthor: basePost({
    author: makeAuthor('Nimrod Kramer', 1, ContentPreferenceStatus.Follow),
  }),
  articleBlockedAuthor: basePost({
    author: makeAuthor('Nimrod Kramer', 1, ContentPreferenceStatus.Blocked),
  }),
  articleNoTags: basePost({ tags: [] }),
  articleManyTags: basePost({
    tags: [
      'genai',
      'mcp',
      'ai-agents',
      'architecture',
      'llm',
      'microservices',
      'kubernetes',
      'observability',
    ],
  }),
  video: basePost({
    type: PostType.VideoYouTube,
    title: 'MCP in 100 seconds',
    source: machineSource('youtube', 'Fireship', avatar(3)),
    author: undefined,
    tags: ['mcp', 'genai'],
  }),
  share: basePost({
    type: PostType.Share,
    title: 'This changed how I structure agents',
    source: squadSource(true),
    author: makeAuthor('Lee Hansel', 4),
    tags: [],
    sharedPost: {
      id: 'shared',
      title: 'Type-safe React Query',
      image: avatar(6),
      commentsPermalink: 'https://app.daily.dev/posts/shared',
      type: PostType.Article,
      source: tkdodo,
      tags: ['backend', 'typescript', 'react-query'],
    } as Post['sharedPost'],
  }),
  squadFreeform: basePost({
    type: PostType.Freeform,
    title: 'Which vector DB are you all using?',
    source: squadSource(true),
    author: makeAuthor('Chris Bongers', 5),
    tags: ['databases', 'genai'],
  }),
  squadNotMember: basePost({
    type: PostType.Freeform,
    title: 'Show and tell: my MCP server',
    source: squadSource(false),
    author: makeAuthor('Chris Bongers', 5),
    tags: ['mcp'],
  }),
  userPost: basePost({
    type: PostType.Freeform,
    title: 'What I learned shipping agents to prod',
    source: userSource,
    author: makeAuthor('Ido Shamun', 2),
    tags: ['ai-agents', 'devops'],
  }),
  poll: basePost({
    type: PostType.Poll,
    title: 'Which agent framework do you use?',
    source: squadSource(true),
    author: makeAuthor('Chris Bongers', 5),
    tags: ['ai-agents'],
  }),
  collection: basePost({
    type: PostType.Collection,
    title: 'Everything that happened with MCP this week',
    source: machineSource('collections', 'daily.dev', avatar(7)),
    author: undefined,
    tags: ['mcp', 'genai', 'ai-agents'],
  }),
  social: basePost({
    type: PostType.SocialTwitter,
    title: 'Hot take: agents need fewer tools, not more',
    source: machineSource('x', 'X', avatar(8)),
    author: undefined,
    tags: ['ai-agents'],
  }),
  welcome: basePost({
    type: PostType.Welcome,
    title: 'Welcome to Web Dev Squad',
    source: squadSource(true),
    author: makeAuthor('Web Dev Squad admin', 9),
    tags: [],
  }),
  trending: basePost({ trending: 120 }),
} satisfies Record<string, Post>;

export const explanations = {
  full: {
    matches: [
      {
        id: 'genai',
        label: 'genai',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Main,
        origin: RecommendationMatchOrigin.Selected,
        points: 140,
      },
      {
        id: 'mcp',
        label: 'mcp',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Main,
        origin: RecommendationMatchOrigin.Reading,
        points: 96,
      },
      {
        id: 'ai-agents',
        label: 'ai-agents',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Supporting,
        origin: RecommendationMatchOrigin.Selected,
        points: 78,
      },
      {
        id: 'architecture',
        label: 'architecture',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Supporting,
        origin: RecommendationMatchOrigin.Selected,
        points: 68,
      },
      {
        id: 'llm',
        label: 'llm',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Related,
        origin: RecommendationMatchOrigin.Reading,
        points: 42,
      },
      {
        id: 'tds',
        label: 'Towards Data Science',
        kind: RecommendationMatchKind.Source,
        origin: RecommendationMatchOrigin.Following,
        points: 54,
      },
      {
        id: 'author-1',
        label: 'Nimrod Kramer',
        kind: RecommendationMatchKind.Author,
        origin: RecommendationMatchOrigin.Reading,
        points: 31,
      },
    ],
    factors: [
      { label: 'interest match', value: 2.83 },
      { label: 'similar-reader evidence', value: 0 },
      { label: 'community signal', value: 0.271 },
      { label: 'useful new discussion', value: 0.14 },
      { label: 'recent momentum', value: 0.146 },
      { label: 'age', value: -0.084 },
      { label: 'followed source', value: 0 },
      { label: 'recently seen', value: -0.251 },
      { label: 'topic seen lately', value: -0.312 },
      { label: 'source variety', value: 0 },
      { label: 'similar to chosen cards', value: -0.017 },
      { label: 'new interest on screen', value: 0.16 },
      { label: 'profile focus', value: 0.08 },
    ],
    finalScore: 2.964,
  },
  sourceLed: {
    matches: [
      {
        id: 'tds',
        label: 'Towards Data Science',
        kind: RecommendationMatchKind.Source,
        origin: RecommendationMatchOrigin.Following,
        points: 120,
      },
      {
        id: 'genai',
        label: 'genai',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Main,
        origin: RecommendationMatchOrigin.Selected,
        points: 64,
      },
    ],
    factors: [
      { label: 'followed source', value: 1.42 },
      { label: 'interest match', value: 0.91 },
      { label: 'community signal', value: 0.05 },
      { label: 'recently seen', value: -0.12 },
    ],
    finalScore: 2.26,
  },
  readingOnly: {
    matches: [
      {
        id: 'mcp',
        label: 'mcp',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Main,
        origin: RecommendationMatchOrigin.Reading,
        points: 58,
      },
      {
        id: 'llm',
        label: 'llm',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Related,
        origin: RecommendationMatchOrigin.Reading,
        points: 21,
      },
    ],
    factors: [
      { label: 'interest match', value: 0.62 },
      { label: 'similar-reader evidence', value: 0.88 },
      { label: 'recent momentum', value: 0.41 },
      { label: 'age', value: -0.2 },
      { label: 'topic seen lately', value: -0.64 },
    ],
    finalScore: 1.07,
  },
  matchesOnly: {
    matches: [
      {
        id: 'genai',
        label: 'genai',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Main,
        origin: RecommendationMatchOrigin.Selected,
        points: 140,
      },
      {
        id: 'ai-agents',
        label: 'ai-agents',
        kind: RecommendationMatchKind.Topic,
        role: RecommendationMatchRole.Supporting,
        origin: RecommendationMatchOrigin.Selected,
        points: 78,
      },
    ],
  },
} satisfies Record<string, RecommendationExplanation>;

// Providers each panel mounts fetch these on load and log analytics; answer
// them so the gallery doesn't fire dozens of unhandled requests.
export const providerHandlers = [
  graphql.query('CompletedUserActions', () =>
    HttpResponse.json({ data: { actions: [] } }),
  ),
  graphql.query('PersonalizedDigest', () =>
    HttpResponse.json({ data: { personalizedDigest: [] } }),
  ),
  graphql.query('NotificationPreferences', () =>
    HttpResponse.json({ data: { notificationPreferences: [] } }),
  ),
  http.post('*/e', () => new HttpResponse(null, { status: 204 })),
];

export interface Scenario {
  title: string;
  note?: string;
  post: Post;
  feedName?: string;
  customFeedId?: string;
  includeTags?: string[];
  blockedTags?: string[];
  followSource?: boolean;
  blockSource?: boolean;
  explanation?: RecommendationExplanation;
}

const SeedScenario = ({
  scenario,
  children,
}: PropsWithChildren<{ scenario: Scenario }>): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const { post } = scenario;
    const feedSettings = {
      tagsCategories: [],
      feedSettings: {
        includeTags: scenario.includeTags ?? [],
        blockedTags: scenario.blockedTags ?? [],
        includeSources: scenario.followSource ? [post.source] : [],
        excludeSources: scenario.blockSource ? [post.source] : [],
        advancedSettings: [],
      },
    };
    client.setQueryData(getFeedSettingsQueryKey(user), feedSettings);
    if (scenario.customFeedId) {
      client.setQueryData(
        getFeedSettingsQueryKey(user, scenario.customFeedId),
        feedSettings,
      );
    }
    client.setQueryData(getPostByIdKey(post.id), { post });
    setIsSeeded(true);
  }, [client, user, scenario]);

  return isSeeded ? <>{children}</> : null;
};

export const ScenarioProviders = ({
  scenario,
  children,
}: PropsWithChildren<{ scenario: Scenario }>): ReactElement => (
  <ExtensionProviders>
    <div id="__next">
      <SeedScenario scenario={scenario}>{children}</SeedScenario>
    </div>
  </ExtensionProviders>
);

export const ScenarioPanel = ({
  scenario,
}: {
  scenario: Scenario;
}): ReactElement => (
  <figure className="flex w-full min-w-0 max-w-[26.25rem] flex-col gap-3">
    <figcaption className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">
        {scenario.title}
      </span>
      {scenario.note && (
        <span className="text-text-tertiary typo-footnote">
          {scenario.note}
        </span>
      )}
    </figcaption>
    <div className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary bg-accent-pepper-subtlest shadow-2">
      <ScenarioProviders scenario={scenario}>
        <WhyRecommendedContent
          post={scenario.post}
          feedName={scenario.feedName ?? SharedFeedPage.MyFeed}
          customFeedId={scenario.customFeedId}
          explanation={scenario.explanation}
          onShowFewer={fn()}
          onClose={fn()}
        />
      </ScenarioProviders>
    </div>
  </figure>
);

export const ScenarioGrid = ({
  title,
  description,
  scenarios,
}: {
  title: string;
  description: ReactNode;
  scenarios: Scenario[];
}): ReactElement => (
  <div className="flex flex-col gap-8 p-6 tablet:p-10">
    <header className="flex max-w-[45rem] flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-title2">{title}</h1>
      <p className="text-text-secondary typo-callout">{description}</p>
    </header>
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 laptop:grid-cols-2 laptopL:grid-cols-3">
      {scenarios.map((scenario) => (
        <ScenarioPanel key={scenario.title} scenario={scenario} />
      ))}
    </div>
  </div>
);

export const ModalScenario = ({
  scenario,
}: {
  scenario: Scenario;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ScenarioProviders scenario={scenario}>
      <div className="p-6">
        <Button onClick={() => setIsOpen(true)}>Why am I seeing this?</Button>
      </div>
      {isOpen && (
        <WhyRecommendedModal
          isOpen
          post={scenario.post}
          feedName={scenario.feedName ?? SharedFeedPage.MyFeed}
          customFeedId={scenario.customFeedId}
          explanation={scenario.explanation}
          onShowFewer={fn()}
          onRequestClose={() => setIsOpen(false)}
        />
      )}
    </ScenarioProviders>
  );
};

export const feeds = {
  forYou: SharedFeedPage.MyFeed,
  popular: SharedFeedPage.Popular,
  explore: OtherFeedPage.Explore,
  following: OtherFeedPage.Following,
  custom: SharedFeedPage.Custom,
};
