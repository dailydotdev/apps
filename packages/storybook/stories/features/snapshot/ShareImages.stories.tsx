import React, { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { ProfileSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotCard';
import { ReadingOverviewSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ReadingOverviewSnapshotCard';
import { BadgesSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/BadgesSnapshotCard';
import { AchievementsSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AchievementsSnapshotCard';
import { AchievementSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AchievementSnapshotCard';
import { AchievementRarityTier } from '@dailydotdev/shared/src/features/profile/components/achievements/achievementRarity';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { findHighlightRange } from '@dailydotdev/shared/src/features/snapshot/snapshotText';
import { ListSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ListSnapshotCard';
import { getSnapshotCaptureOptions } from '@dailydotdev/shared/src/features/snapshot/snapshotCapture';
import { SnapshotEyebrow } from '@dailydotdev/shared/src/features/snapshot/SnapshotEyebrow';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import {
  ACHIEVEMENT_ART,
  avatarUri,
  COVER_PLACEHOLDER,
  HEATMAP,
  PROFILE_USER,
  UNLOCKED_ART,
} from './snapshotFixtures';
import type { SnapshotContentProps } from './SnapshotContent';
import { HOT_TAKE_EYEBROW_GRADIENT, SnapshotContent } from './SnapshotContent';

/** The post page as it actually reads, for surface 1. */

/** A Happening now highlight, for surface 2 — same card, its own copy. */

/**
 * A watercooler post, for surface 4 — a person's own words, so they take the
 * credit rather than a publication.
 */

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

const HIGHLIGHT_PARAGRAPH =
  "He walks through the last two years without flinching: the week ChatGPT shipped, the quarter the layoffs started, the month Tailwind's business model came apart. The speaker shares a personal timeline from ChatGPT's release through AI-driven layoffs, Tailwind's business model disruption, and his own layoff. None of it is framed as a warning \u2014 it reads as the ordinary shape of a career in this industry now.";
const HIGHLIGHT_MARKED =
  "The speaker shares a personal timeline from ChatGPT's release through AI-driven layoffs, Tailwind's business model disruption, and his own layoff";
const HIGHLIGHT_PASSAGE = {
  passage: HIGHLIGHT_PARAGRAPH,
  highlight: findHighlightRange(HIGHLIGHT_PARAGRAPH, HIGHLIGHT_MARKED),
};

const PLACEMENTS: Placement[] = [
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
        {...HIGHLIGHT_PASSAGE}
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
      centered: true,
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
        completedAt="Jun 1, 2026"
        description="Spend 100,000 Cores without running dry."
        image={ACHIEVEMENT_ART}
        name="Can't spend it all"
        rarity={0.01}
        seed="achievement"
        tier={AchievementRarityTier.Emerald}
        user={{ ...PROFILE_USER, image: avatarUri('#B14BD7', 'T') }}
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
