import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, waitFor } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import type { MenuItemProps } from '@dailydotdev/shared/src/components/dropdown/common';
import { MenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import {
  BlockIcon,
  DownvoteIcon,
  EyeIcon,
  FlagIcon,
  InfoIcon,
  MenuIcon as RawMenuIcon,
  PlusIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
import WhyRecommendedModal from './components/WhyRecommendedModal';
import type { Scenario } from './whyRecommended.mocks';
import {
  explanations,
  feeds,
  ModalScenario,
  posts,
  ScenarioGrid,
  ScenarioProviders,
} from './whyRecommended.mocks';

const meta: Meta = {
  title: 'Features/Why Recommended',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const openScoreMath = async (root: HTMLElement): Promise<void> => {
  const getToggles = () =>
    root.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]');
  await waitFor(() => {
    if (!getToggles().length) {
      throw new Error('Waiting for score breakdown');
    }
  });
  getToggles().forEach((toggle) => toggle.click());
};

const anatomy: Scenario[] = [
  {
    title: 'With ranking data',
    note: 'Reason, match points and the score breakdown, once the feed service returns a per-post explanation.',
    post: posts.article,
    includeTags: ['genai', 'ai-agents', 'architecture'],
    followSource: true,
    explanation: explanations.full,
  },
  {
    title: 'Matches without score math',
    note: 'Match points but no factor breakdown, so the breakdown link hides.',
    post: posts.article,
    includeTags: ['genai', 'ai-agents'],
    explanation: explanations.matchesOnly,
  },
  {
    title: 'Ships today (no ranking data)',
    note: 'Reason and matches come from what you follow. No points, no breakdown.',
    post: posts.article,
    includeTags: ['genai', 'mcp'],
  },
];

export const Overview: Story = {
  render: () => (
    <ScenarioGrid
      title="Why am I seeing this?"
      description="Opened from the post ⋯ menu on For You, custom feeds, Popular, Explore and Following. One sentence answers why, the matched items carry their own follow and block controls, and the score breakdown stays one click away."
      scenarios={anatomy}
    />
  ),
  play: ({ canvasElement }) => openScoreMath(canvasElement),
};

const useCases: Scenario[] = [
  {
    title: 'One topic you selected',
    post: posts.article,
    includeTags: ['genai'],
  },
  {
    title: 'Several topics you selected',
    post: posts.article,
    includeTags: ['genai', 'mcp', 'llm'],
  },
  {
    title: 'Source you follow',
    post: posts.article,
    followSource: true,
    includeTags: ['genai'],
  },
  {
    title: 'Source you follow, with ranking data',
    post: posts.article,
    followSource: true,
    includeTags: ['genai'],
    explanation: explanations.sourceLed,
  },
  {
    title: 'Author you follow',
    post: posts.articleFollowedAuthor,
    includeTags: ['genai'],
  },
  {
    title: "Squad you're in",
    post: posts.squadFreeform,
  },
  {
    title: 'Trending on Popular',
    post: posts.trending,
    feedName: feeds.popular,
  },
  {
    title: 'Explore feed, nothing followed',
    post: posts.article,
    feedName: feeds.explore,
  },
  {
    title: 'Following feed',
    post: posts.article,
    feedName: feeds.following,
    followSource: true,
  },
  {
    title: 'Inferred from your reading',
    note: 'Nothing is followed. The ranker matched topics from reading history.',
    post: posts.article,
    explanation: explanations.readingOnly,
  },
  {
    title: 'Nothing matched you',
    note: 'Falls back to the general activity reason.',
    post: posts.article,
  },
  {
    title: 'Custom feed',
    note: 'Blocking removes from this feed only, so labels change.',
    post: posts.article,
    feedName: feeds.custom,
    customFeedId: 'my-ai-feed',
    includeTags: ['genai'],
    blockedTags: ['llm'],
  },
  {
    title: 'Blocked author, source and topic',
    note: 'Blocked rows strike through and offer Unblock.',
    post: posts.articleBlockedAuthor,
    blockSource: true,
    blockedTags: ['architecture'],
  },
  {
    title: 'Many topics',
    post: posts.articleManyTags,
    includeTags: ['kubernetes', 'genai'],
  },
  {
    title: 'No topics, no author',
    post: { ...posts.articleNoTags, author: undefined },
  },
];

export const UseCases: Story = {
  render: () => (
    <ScenarioGrid
      title="Use cases"
      description="Every main-reason branch, feed context and follow or block state. The reason is picked in this order: author you follow, source you follow, squad you're in, topics you selected, trending, then your general activity."
      scenarios={useCases}
    />
  ),
};

const postTypes: Scenario[] = [
  {
    title: 'Article',
    post: posts.article,
    includeTags: ['genai', 'mcp'],
    followSource: true,
    explanation: explanations.full,
  },
  {
    title: 'Video (YouTube)',
    note: 'No author row: channels are sources.',
    post: posts.video,
    includeTags: ['mcp'],
  },
  {
    title: 'Share in a squad',
    note: 'Topics come from the shared post.',
    post: posts.share,
    includeTags: ['typescript'],
  },
  {
    title: 'Squad post, member',
    post: posts.squadFreeform,
    includeTags: ['genai'],
  },
  {
    title: 'Squad post, not a member',
    note: 'Squads can be blocked, not followed, from here.',
    post: posts.squadNotMember,
    includeTags: ['mcp'],
  },
  {
    title: 'Personal post',
    note: 'User sources hide the source row; the author row covers it.',
    post: posts.userPost,
    includeTags: ['ai-agents'],
  },
  {
    title: 'Poll',
    post: posts.poll,
    includeTags: ['ai-agents'],
  },
  {
    title: 'Collection',
    post: posts.collection,
    includeTags: ['mcp', 'genai'],
  },
  {
    title: 'Social (X)',
    post: posts.social,
    feedName: feeds.popular,
  },
  {
    title: 'Squad welcome post',
    post: posts.welcome,
  },
];

const NotOffered = (): ReactElement => (
  <div className="flex max-w-[45rem] flex-col gap-2 rounded-16 border border-dashed border-border-subtlest-secondary p-4 text-text-tertiary typo-callout">
    <span className="font-bold text-text-primary">No menu entry</span>
    Briefs and boosted posts (ads) never show &quot;Why am I seeing this?&quot;.
    Tag, source, squad and profile pages hide it too, because the page already
    says why the post is there.
  </div>
);

export const PostTypes: Story = {
  render: () => (
    <>
      <ScenarioGrid
        title="Post types"
        description="What the explanation and controls look like for each post type the menu offers it on."
        scenarios={postTypes}
      />
      <div className="px-6 pb-10 tablet:px-10">
        <NotOffered />
      </div>
    </>
  ),
};

export const ScoreMath: Story = {
  render: () => (
    <ScenarioGrid
      title="Score math"
      description="The collapsible breakdown, opened. Bars are scaled to the largest factor; green raised the rank, red lowered it."
      scenarios={[
        {
          title: 'Topic-led',
          post: posts.article,
          includeTags: ['genai', 'ai-agents', 'architecture'],
          followSource: true,
          explanation: explanations.full,
        },
        {
          title: 'Source-led',
          post: posts.article,
          followSource: true,
          explanation: explanations.sourceLed,
        },
        {
          title: 'Reading-led, heavy penalties',
          post: posts.article,
          explanation: explanations.readingOnly,
        },
      ]}
    />
  ),
  play: ({ canvasElement }) => openScoreMath(canvasElement),
};

export const Modal: Story = {
  render: () => (
    <ModalScenario
      scenario={{
        title: 'Modal',
        post: posts.article,
        includeTags: ['genai', 'ai-agents', 'architecture'],
        followSource: true,
        explanation: explanations.full,
      }}
    />
  ),
};

export const ModalWithoutRankingData: Story = {
  render: () => (
    <ModalScenario
      scenario={{
        title: 'Modal without ranking data',
        post: posts.article,
        includeTags: ['genai', 'mcp'],
      }}
    />
  ),
};

export const MobileDrawer: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <ModalScenario
      scenario={{
        title: 'Mobile drawer',
        post: posts.article,
        includeTags: ['genai', 'ai-agents', 'architecture'],
        followSource: true,
        explanation: explanations.full,
      }}
    />
  ),
};

const MenuEntryHarness = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const post = posts.article;
  const menuOptions: MenuItemProps[] = [
    { icon: <MenuIcon Icon={ShareIcon} />, label: 'Share via' },
    {
      icon: <MenuIcon Icon={InfoIcon} />,
      label: 'Why am I seeing this?',
      action: () => setIsOpen(true),
    },
    { icon: <MenuIcon Icon={EyeIcon} />, label: 'Hide' },
    { icon: <MenuIcon Icon={FlagIcon} />, label: 'Report' },
    { icon: <MenuIcon Icon={DownvoteIcon} />, label: 'Downvote' },
    {
      icon: <MenuIcon Icon={PlusIcon} />,
      label: `Follow ${post.source?.name}`,
    },
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      label: `Block ${post.source?.name}`,
    },
    ...(post.tags ?? []).map((tag) => ({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: `Block #${tag}`,
    })),
  ];

  return (
    <>
      <div className="flex max-w-[22rem] items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-text-tertiary typo-footnote">
            {post.source?.name}
          </span>
          <span className="font-bold text-text-primary typo-title3">
            {post.title}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<RawMenuIcon />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuOptions options={menuOptions} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isOpen && (
        <WhyRecommendedModal
          isOpen
          post={post}
          feedName={feeds.forYou}
          onShowFewer={fn()}
          onRequestClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export const MenuEntry: Story = {
  render: () => (
    <ScenarioProviders
      scenario={{
        title: 'Menu entry',
        post: posts.article,
        includeTags: ['genai', 'mcp'],
      }}
    >
      <div className="p-10">
        <MenuEntryHarness />
      </div>
    </ScenarioProviders>
  ),
};
