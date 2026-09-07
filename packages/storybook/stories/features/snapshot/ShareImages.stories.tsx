import React, { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import type { SnapshotContentProps } from '@dailydotdev/shared/src/features/snapshot/SnapshotContent';
import {
  HIGHLIGHTS_EYEBROW_GRADIENT,
  HOT_TAKE_EYEBROW_GRADIENT,
  SnapshotContent,
} from '@dailydotdev/shared/src/features/snapshot/SnapshotContent';
import { ProfileSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotCard';
import { ReadingOverviewSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ReadingOverviewSnapshotCard';
import { BadgesSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/BadgesSnapshotCard';
import { AchievementsSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AchievementsSnapshotCard';
import { AchievementSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AchievementSnapshotCard';
import { AchievementRarityTier } from '@dailydotdev/shared/src/features/profile/components/achievements/achievementRarity';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { InviteSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/InviteSnapshotCard';
import { StreakSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/StreakSnapshotCard';
import { EntitySnapshotCard } from '@dailydotdev/shared/src/features/snapshot/EntitySnapshotCard';
import { DiscussionSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/DiscussionSnapshotCard';
import { ListSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ListSnapshotCard';
import { CelebrationSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/CelebrationSnapshotCard';
import { getSnapshotCaptureOptions } from '@dailydotdev/shared/src/features/snapshot/snapshotCapture';
import { PostSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/PostSnapshotCard';
import { SnapshotEyebrow } from '@dailydotdev/shared/src/features/snapshot/SnapshotEyebrow';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { LeaderboardSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/LeaderboardSnapshotCard';
import { AwardSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AwardSnapshotCard';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import {
  ACHIEVEMENT_ART,
  avatarUri,
  BOBBY_AVATAR,
  COVER_PLACEHOLDER,
  HEATMAP,
  PROFILE_USER,
  thumbUri,
  UNLOCKED_ART,
} from './snapshotFixtures';

/** The post page as it actually reads, for surface 1. */
const POST = {
  id: 'cdpr-physical',
  title: "CD Projekt Red won't be abandoning physical releases",
  summary:
    "CD Projekt Red joint-CEO Michal Nowakowski says the studio has no plans to abandon physical game releases, despite Sony announcing it will end physical media production for PlayStation in 2028. Nowakowski notes CDPR doesn't control disc manufacturing (platform holders like Sony, Microsoft, and Nintendo do), but pledges to keep bundling extras into physical editions, potentially swapping the game disc for a download code, similar to the approach planned for GTA VI.",
  createdAt: '2026-09-03T09:00:00.000Z',
  readTime: 3,
  domain: 'gamedeveloper.com',
  image: thumbUri('#2A1436', '#0E0A18', 'The Witcher III'),
  tags: ['tech-news', 'gaming', 'cd-projekt-red'],
  numUpvotes: 44,
  numComments: 11,
  analytics: { impressions: 429900 },
  source: {
    id: 'game-developer',
    name: 'Game Developer',
    image: avatarUri('#EC527A', 'G'),
  },
} as Post;

/** A Happening now highlight, for surface 2 — same card, its own copy. */
const HIGHLIGHT_POST = {
  id: 'qwen-3-8-max',
  summary:
    'Alibaba released downloadable weights for Qwen3.8-Max, a 2.4 trillion-parameter mixture-of-experts vision-language model, alongside the smaller Qwen3.8-27B, within a week of unveiling the Max model.',
  source: {
    id: 'alibaba-cloud',
    name: 'Alibaba Cloud',
    image: avatarUri('#FF6A00', 'A'),
  },
} as Post;

/**
 * A watercooler post, for surface 4 — a person's own words, so they take the
 * credit rather than a publication.
 */
const WATERCOOLER_POST = {
  id: 'watercooler-ripgrep',
  summary:
    'Mine is ripgrep. I use it more than my editor at this point — every investigation starts with a search, and nothing else comes close on a big monorepo.',
} as Post;

const WATERCOOLER_AUTHOR = {
  name: 'Ante Barić',
  image: avatarUri('#EC527A', 'A'),
};

interface Placement {
  id: string;
  surface: string;
  watermark?: string;
  /** Rides the logo row, far right — the surface's own label. */
  eyebrow?: { label: string; gradient?: string };
  /** Height follows the content, for the text-heavy surfaces. */
  grow?: boolean;
  content?: SnapshotContentProps;
  render?: (ref: (node: HTMLDivElement | null) => void) => React.ReactNode;
}

const PLACEMENTS: Placement[] = [
  {
    id: 'post',
    surface: '1 · Post page (under the TLDR)',
    render: (ref) => <PostSnapshotCard ref={ref} post={POST} />,
  },
  {
    id: 'highlight-text',
    surface: '1b · Highlighted text (reader selection)',
    render: (ref) => (
      <HighlightTextSnapshotCard
        ref={ref}
        seed="highlight-text"
        source={{
          name: 'Traversy Media',
          image: avatarUri('#B14BD7', 'T'),
        }}
        text="The speaker shares a personal timeline from ChatGPT's release through AI-driven layoffs, Tailwind's business model disruption, and his own layoff"
      />
    ),
  },
  {
    id: 'highlight',
    surface: '2 · Happening now (expanded highlight)',
    render: (ref) => (
      <PostSnapshotCard
        ref={ref}
        eyebrow="Happening now"
        eyebrowGradient={HIGHLIGHTS_EYEBROW_GRADIENT}
        post={HIGHLIGHT_POST}
      />
    ),
  },
  {
    id: 'leaderboard',
    surface: '3 · Leaderboard row',
    render: (ref) => (
      <LeaderboardSnapshotCard
        ref={ref}
        board="Highest level"
        handle="@bobbyiliev"
        image={BOBBY_AVATAR}
        level={103}
        levelProgress={74}
        name="Bobby Iliev"
        rank={1}
        reputation={76800}
        score={15500}
        seed="leaderboard"
      />
    ),
  },
  {
    id: 'watercooler',
    surface: '4 · Watercooler post',
    render: (ref) => (
      <PostSnapshotCard
        ref={ref}
        credit={WATERCOOLER_AUTHOR}
        post={WATERCOOLER_POST}
      />
    ),
  },
  {
    id: 'hot-take',
    surface: '5 · Hot take',
    watermark: '🔥',
    eyebrow: { label: 'Hot take', gradient: HOT_TAKE_EYEBROW_GRADIENT },
    grow: true,
    content: {
      // One take, one type style: split across a title and a body it read as
      // two voices arguing the same point.
      title:
        'Tabs won. Prettier just hid the bodies. Every formatter argument is a proxy war over indentation.',
      titleLines: 0,
      stat: { value: '128', label: 'found this hot' },
      statVariant: 'inline' as const,
    },
  },
  {
    id: 'profile',
    surface: '6a · Profile header',
    render: (ref) => (
      <ProfileSnapshotCard
        ref={ref}
        bio="Building the place developers go to grow"
        cover={COVER_PLACEHOLDER}
        handle="@tomer"
        image={avatarUri('#B14BD7', 'T')}
        joined="Jun 2021"
        name="Tomer Redlich"
        postsRead={4128}
        reputation={12400}
        seed="profile"
      />
    ),
  },
  {
    id: 'reading-overview',
    surface: '6b · Reading overview',
    render: (ref) => (
      <ReadingOverviewSnapshotCard
        ref={ref}
        heatmap={HEATMAP}
        longestStreak={31}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
        monthsLabel="in the last months"
        postsRead={397}
        seed="reading-overview"
        topTags={[
          { name: 'Security', percentage: 27 },
          { name: 'AI Agents', percentage: 26 },
          { name: 'Open Source', percentage: 22 },
          { name: 'AI Coding', percentage: 22 },
          { name: 'AI', percentage: 21 },
          { name: 'GitHub', percentage: 19 },
        ]}
        totalReadingDays={720}
      />
    ),
  },
  {
    id: 'badges',
    surface: '6c · Badges & awards',
    render: (ref) => (
      <BadgesSnapshotCard
        ref={ref}
        awards={[
          { name: 'blush', emoji: '😊', count: 47 },
          { name: 'laugh', emoji: '😆', count: 22 },
          { name: 'star', emoji: '🌟', count: 6 },
          { name: 'heart', emoji: '💜', count: 4 },
          { name: 'cash', emoji: '💵', count: 2 },
          { name: 'goodboy', emoji: '🐶', count: 1 },
        ]}
        badges={[
          { keyword: 'clickhouse', earnedAt: 'June 2026' },
          { keyword: 'github actions', earnedAt: 'April 2026' },
          { keyword: 'ai agents', earnedAt: 'March 2026' },
          { keyword: 'claude', earnedAt: 'February 2026' },
        ]}
        seed="badges"
        topReaderBadges={10}
        totalAwards={87}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
      />
    ),
  },
  {
    id: 'achievements-widget',
    surface: '6d · Achievements widget',
    render: (ref) => (
      <AchievementsSnapshotCard
        ref={ref}
        achievements={UNLOCKED_ART.map((image, index) => ({
          name: `achievement-${index}`,
          image,
        }))}
        points={1240}
        seed="achievements"
        total={60}
        unlocked={18}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
      />
    ),
  },
  {
    id: 'achievement',
    surface: '7 · Single achievement',
    render: (ref) => (
      <AchievementSnapshotCard
        ref={ref}
        completedAt="Jun 1"
        description="Spend 100,000 Cores without running dry."
        image={ACHIEVEMENT_ART}
        name="Can't spend it all"
        rarity={0.01}
        seed="achievement"
        tier={AchievementRarityTier.Emerald}
      />
    ),
  },
  {
    id: 'invite',
    surface: '8 · Invite a friend (#6366)',
    render: (ref) => (
      <InviteSnapshotCard
        ref={ref}
        handle="@tomer"
        headline="Come read with me on daily.dev"
        image={avatarUri('#B14BD7', 'T')}
        link="daily.dev/join/tomer"
        name="Tomer Redlich"
        perk="We both get a month of Plus"
        seed="invite"
      />
    ),
  },
  {
    id: 'award',
    surface: '9b · Being awarded (#6581)',
    render: (ref) => (
      <AwardSnapshotCard
        ref={ref}
        award="Superb"
        emoji="🌟"
        from="@capjavert"
        reason="Why iconic tech brands like HTC and LG lost their dominance"
        seed="award"
        total={12}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
      />
    ),
  },
  {
    id: 'streak',
    surface: '9 · Reading streak (#6358)',
    render: (ref) => (
      <StreakSnapshotCard
        ref={ref}
        days={100}
        longestStreak={100}
        milestone="A new personal best"
        seed="streak"
        totalReadingDays={720}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
      />
    ),
  },
  {
    id: 'tag',
    surface: '10a · Tag page (#6357)',
    render: (ref) => (
      <EntitySnapshotCard
        ref={ref}
        description="Everything happening in TypeScript, ranked by the developers reading it."
        kind="tag"
        name="typescript"
        seed="tag"
        stats={[
          { value: 48200, label: 'Followers' },
          { value: 1240, label: 'Posts' },
          { value: 96, label: 'This week' },
        ]}
      />
    ),
  },
  {
    id: 'source',
    surface: '10b · Source page (#6357)',
    render: (ref) => (
      <EntitySnapshotCard
        ref={ref}
        description="Deep dives on Android, hardware and the software that runs it."
        handle="@xda"
        image={avatarUri('#B14BD7', 'X')}
        kind="source"
        name="XDA Developers"
        seed="source"
        stats={[
          { value: 12400, label: 'Followers' },
          { value: 8600, label: 'Posts' },
          { value: 34, label: 'This week' },
        ]}
      />
    ),
  },
  {
    id: 'squad',
    surface: '11 · Squad (#6363)',
    render: (ref) => (
      <EntitySnapshotCard
        ref={ref}
        description="Where the frontend crowd argues about bundlers and ships anyway."
        handle="@frontend-fans"
        image={avatarUri('#624AD3', 'F')}
        kind="squad"
        name="Frontend Fans"
        seed="squad"
        stats={[
          { value: 3400, label: 'Members' },
          { value: 820, label: 'Posts' },
          { value: 47, label: 'This week' },
        ]}
      />
    ),
  },
  {
    id: 'discussion',
    surface: '12 · Discussion (#6349)',
    render: (ref) => (
      <DiscussionSnapshotCard
        ref={ref}
        author={{
          name: 'Ante Barić',
          handle: '@capjavert',
          image: avatarUri('#EC527A', 'A'),
        }}
        comment="The bundler war is over and nobody noticed. We spent five years optimising cold starts and the actual bottleneck was always the 400kb of analytics we shipped on every page."
        seed="discussion"
      />
    ),
  },
  {
    id: 'briefing',
    surface: '13a · Briefing / digest (#6353)',
    render: (ref) => (
      <ListSnapshotCard
        ref={ref}
        eyebrow="Your briefing"
        items={[
          {
            title: 'Alibaba open-sources Qwen3.8-Max weights',
            meta: 'AI · 4m read',
          },
          {
            title: 'TypeScript 6.2 ships project-wide inference',
            meta: 'TypeScript · 6m read',
          },
          {
            title: 'The bundler war is over and nobody noticed',
            meta: 'Frontend · 3m read',
          },
          {
            title: 'Postgres 19 makes logical replication boring',
            meta: 'Databases · 8m read',
          },
          {
            title: 'What a decade of Rust taught us about ownership',
            meta: 'Rust · 11m read',
          },
        ]}
        seed="briefing"
        subtitle="Short briefing by @tomer"
        title="5 things worth your morning"
      />
    ),
  },
  {
    id: 'best-of',
    surface: '13b · Best of / collection (#6364)',
    render: (ref) => (
      <ListSnapshotCard
        ref={ref}
        eyebrow="Best of August"
        items={[
          {
            title: 'The bundler war is over and nobody noticed',
            meta: '2.4K upvotes',
          },
          {
            title: 'Alibaba open-sources Qwen3.8-Max weights',
            meta: '1.9K upvotes',
          },
          {
            title: 'Why your CI is slow and it is not the tests',
            meta: '1.6K upvotes',
          },
          { title: 'A decade of Rust, in one migration', meta: '1.2K upvotes' },
          {
            title: 'Postgres 19 makes logical replication boring',
            meta: '980 upvotes',
          },
        ]}
        seed="best-of"
        subtitle="The 5 posts developers upvoted most"
        title="August's most upvoted reads"
      />
    ),
  },
  {
    id: 'celebration',
    surface: '14 · Level up (#6360)',
    render: (ref) => (
      <CelebrationSnapshotCard
        ref={ref}
        headline="Level 104 reached"
        level={104}
        levelProgress={18}
        questsCompleted={286}
        seed="celebration"
        totalXp={15500}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
      />
    ),
  },
];

const Gallery = () => {
  const stage = useRef<Record<string, HTMLDivElement | null>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAll = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      // Sequential: snapdom rasterizes one 1080² tree at a time, and ten in
      // parallel starves the main thread for long enough to look hung.
      const next: Record<string, string> = {};

      for (const placement of PLACEMENTS) {
        const node = stage.current[placement.id];

        if (node) {
          // eslint-disable-next-line no-await-in-loop
          const blob = await captureShareImage(
            node,
            getSnapshotCaptureOptions(node),
          );
          next[placement.id] = URL.createObjectURL(blob);
          setImages({ ...next });
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsRunning(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-mega3">
          Snapshot share images — every placement
        </h1>
        <p className="max-w-[48rem] text-text-tertiary typo-body">
          The actual PNG each Snapshot button exports, one per surface. Every
          image is generated by the real capture pipeline, so what you see here
          is what gets shared. Most are 1080×1080; the text surfaces grow taller
          so the image carries more than a screenshot would. Press Generate to
          re-render them all.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant={ButtonVariant.Primary}
            loading={isRunning}
            disabled={isRunning}
            onClick={generateAll}
          >
            Generate all {PLACEMENTS.length}
          </Button>
          {error && (
            <span className="text-status-error typo-footnote">{error}</span>
          )}
        </div>
      </header>

      {/* Off-screen stage: the real cards the capture reads from. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        {PLACEMENTS.map((placement) => {
          const setRef = (node: HTMLDivElement | null) => {
            stage.current[placement.id] = node;
          };

          if (placement.render) {
            return (
              <React.Fragment key={placement.id}>
                {placement.render(setRef)}
              </React.Fragment>
            );
          }

          return (
            <SnapshotFrame
              key={placement.id}
              grow={placement.grow}
              logoAside={
                placement.eyebrow && (
                  <SnapshotEyebrow
                    gradient={placement.eyebrow.gradient}
                    label={placement.eyebrow.label}
                  />
                )
              }
              seed={placement.id}
              watermark={placement.watermark}
              ref={setRef}
            >
              <SnapshotContent
                {...(placement.content as SnapshotContentProps)}
              />
            </SnapshotFrame>
          );
        })}
      </div>

      <div className="grid gap-6 tablet:grid-cols-2 laptopL:grid-cols-3">
        {PLACEMENTS.map((placement) => (
          <figure key={placement.id} className="flex flex-col gap-2">
            <figcaption className="font-bold text-text-tertiary typo-footnote">
              {placement.surface}
            </figcaption>
            {images[placement.id] ? (
              <img
                src={images[placement.id]}
                alt={placement.surface}
                className="w-full rounded-16 border border-border-subtlest-tertiary"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-surface-float text-text-quaternary typo-footnote">
                {isRunning ? 'Rendering…' : 'Not generated yet'}
              </div>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof Gallery> = {
  title: 'Features/Snapshot/Share images',
  component: Gallery,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AllPlacements: StoryObj<typeof Gallery> = {};
