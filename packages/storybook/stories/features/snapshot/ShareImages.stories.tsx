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
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { LeaderboardSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/LeaderboardSnapshotCard';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

// Inlined so the capture never waits on a fetch: MSW intercepts every request
// inside Storybook, and a pending image stalls snapdom's inliner.
const BOBBY_AVATAR = 'data:image/jpeg;base64,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';

const COVER_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 268"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B2A22"/><stop offset="0.55" stop-color="#5A4436"/><stop offset="1" stop-color="#2A2018"/></linearGradient></defs><rect width="800" height="268" fill="url(#c)"/><g fill="#0F0C0A" opacity="0.55"><rect x="120" y="70" width="90" height="110" rx="4"/><rect x="250" y="52" width="130" height="150" rx="4"/><rect x="420" y="74" width="100" height="104" rx="4"/><rect x="560" y="60" width="120" height="132" rx="4"/></g></svg>',
)}`;

// A plausible six-month read history: dense midweek, quieter at the edges.
const HEATMAP = Array.from({ length: 88 }, (_, i) => {
  const wave = Math.sin(i / 5) + Math.cos(i / 3.2);
  return Math.max(0, Math.min(3, Math.round(0.55 + wave * 0.85)));
});

// Real production artwork: media.daily.dev serves these with CORS, so the
// capture can inline them.
const ACHIEVEMENT_ART =
  'https://media.daily.dev/image/upload/s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all';

const UNLOCKED_ART = [
  'https://media.daily.dev/image/upload/s--UV44P2mG--/v1779263302/achievements/big_byte_energy',
  'https://media.daily.dev/image/upload/s--SNnLKKWe--/q_auto/v1773608419/achievements/coraholic',
  'https://media.daily.dev/image/upload/v1770222928/achievements/In_the_big_league.png',
  'https://media.daily.dev/image/upload/s--h7KVoOJI--/q_auto/v1773608418/achievements/referral_spree',
  'https://media.daily.dev/image/upload/v1770222884/achievements/Boosted.png',
  'https://media.daily.dev/image/upload/s--5WqXv9y7--/q_auto/v1773743176/achievements/heros_quest',
  'https://media.daily.dev/image/upload/s--N7NXEDEH--/q_auto/v1770803408/achievements/the_head_of_the_committee.png',
  'https://media.daily.dev/image/upload/s--W0-BqBQd--/v1783416167/achievements/Devil_is_impressed',
  'https://media.daily.dev/image/upload/v1770222923/achievements/Organized.png',
  'https://media.daily.dev/image/upload/v1770222937/achievements/Town_crier.png',
];

const PROFILE_USER = {
  name: 'Tomer Redlich',
  handle: '@tomer',
};

const avatarUri = (fill: string, glyph: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1E2229"/><text x="32" y="43" font-family="sans-serif" font-size="30" font-weight="700" fill="${fill}" text-anchor="middle">${glyph}</text></svg>`,
  )}`;

interface Placement {
  id: string;
  surface: string;
  watermark?: string;
  content?: SnapshotContentProps;
  render?: (ref: (node: HTMLDivElement | null) => void) => React.ReactNode;
}

const PLACEMENTS: Placement[] = [
  {
    id: 'post',
    surface: '1 · Post page (under the TLDR)',
    content: {
      avatar: { src: avatarUri('#B14BD7', 'X'), name: 'XDA Developers' },
      title: 'Why iconic tech brands like HTC and LG lost their dominance',
      meta: ['Aug 24, 2026', '1m read time', 'xda-developers.com'],
      body: "A brief retrospective on how once-dominant tech and smartphone brands declined, citing OnePlus's recent troubles, LG's exit from the mobile business, and HTC's fall from once outselling Apple in America to a niche VR-focused company.",
    },
  },
  {
    id: 'highlight-text',
    surface: '1b · Highlighted text (reader selection)',
    render: (ref) => (
      <HighlightTextSnapshotCard
        ref={ref}
        domain="xda-developers.com"
        postTitle="TypeScript has become the default across frontend frameworks"
        seed="highlight-text"
        source={{
          name: 'XDA Developers',
          image: avatarUri('#B14BD7', 'X'),
        }}
        text="TypeScript has become the default across frontend frameworks"
      />
    ),
  },
  {
    id: 'highlight',
    surface: '2 · Happening now (expanded highlight)',
    content: {
      eyebrow: 'Happening now',
      eyebrowGradient: HIGHLIGHTS_EYEBROW_GRADIENT,
      title:
        'Alibaba open-sources Qwen3.8-Max weights and releases 27B model for local use',
      meta: ['14h ago'],
      body: 'Alibaba released downloadable weights for Qwen3.8-Max, a 2.4 trillion-parameter mixture-of-experts vision-language model, alongside the smaller Qwen3.8-27B, within a week of unveiling the Max model.',
    },
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
    content: {
      avatar: {
        src: avatarUri('#EC527A', 'A'),
        name: 'Ante Barić',
        handle: '@capjavert',
      },
      title: 'What is the one dev tool you would not give up?',
      meta: ['2h ago', '24 comments'],
      body: 'Mine is ripgrep. I use it more than my editor at this point — every investigation starts with a search, and nothing else comes close on a big monorepo.',
    },
  },
  {
    id: 'hot-take',
    surface: '5 · Hot take',
    watermark: '🔥',
    content: {
      eyebrow: 'Hot take',
      eyebrowGradient: HOT_TAKE_EYEBROW_GRADIENT,
      title: 'Tabs won. Prettier just hid the bodies.',
      titleLines: 3,
      body: 'Every formatter argument is a proxy war over indentation.',
      bodyLines: 3,
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
        postTitle="Why iconic tech brands like HTC and LG lost their dominance"
        replies={24}
        seed="discussion"
        upvotes={186}
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
          { title: 'The bundler war is over and nobody noticed', meta: '2.4K upvotes' },
          { title: 'Alibaba open-sources Qwen3.8-Max weights', meta: '1.9K upvotes' },
          { title: 'Why your CI is slow and it is not the tests', meta: '1.6K upvotes' },
          { title: 'A decade of Rust, in one migration', meta: '1.2K upvotes' },
          { title: 'Postgres 19 makes logical replication boring', meta: '980 upvotes' },
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

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

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
          const blob = await captureShareImage(node, CAPTURE_OPTIONS);
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
          The actual 1080×1080 PNG each Snapshot button exports, one per
          surface. Every image is generated by the real capture pipeline, so
          what you see here is what gets shared. Press Generate to re-render
          them all.
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
              seed={placement.id}
              watermark={placement.watermark}
              ref={setRef}
            >
              <SnapshotContent {...(placement.content as SnapshotContentProps)} />
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
