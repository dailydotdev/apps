import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { SnapshotContent } from '@dailydotdev/shared/src/features/snapshot/SnapshotContent';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { SNAPSHOT_TEXT_LIMIT } from '@dailydotdev/shared/src/features/snapshot/snapshotText';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { LeaderboardSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/LeaderboardSnapshotCard';
import { ProfileSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotCard';
import { EntitySnapshotCard } from '@dailydotdev/shared/src/features/snapshot/EntitySnapshotCard';
import { DiscussionSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/DiscussionSnapshotCard';
import { ListSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ListSnapshotCard';
import { StreakSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/StreakSnapshotCard';
import { InviteSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/InviteSnapshotCard';
import { AchievementSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/AchievementSnapshotCard';
import { AchievementRarityTier } from '@dailydotdev/shared/src/features/profile/components/achievements/achievementRarity';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1E2229"/><text x="32" y="44" font-family="sans-serif" font-size="30" font-weight="700" fill="#B14BD7" text-anchor="middle">T</text></svg>',
)}`;

const USER = { name: 'Tomer Redlich', handle: '@tomer', image: AVATAR };

const LOREM =
  'The bundler war is over and nobody noticed, because we spent five entire years optimising cold starts while the actual bottleneck was always the four hundred kilobytes of analytics we shipped on every single page load, and no amount of tree shaking was ever going to fix a problem that lived in the product requirements rather than the build graph.';

const UNBREAKABLE =
  'ReallyLongGenericTypeParameterNameThatNeverBreaks<TInput, TOutput> https://app.daily.dev/posts/some-extremely-long-slug-that-keeps-going-and-going';

const SCALE = 0.34;

interface CaseSpec {
  label: string;
  node: (ref: (n: HTMLDivElement | null) => void) => React.ReactNode;
}

interface CardSpec {
  id: string;
  title: string;
  note: string;
  cases: CaseSpec[];
}

const CARDS: CardSpec[] = [
  {
    id: 'highlight',
    title: 'Highlighted text',
    note: `Scales 72 → 40px by length, then truncates at the last word at ${SNAPSHOT_TEXT_LIMIT} characters.`,
    cases: [
      {
        label: 'Typical (59 chars)',
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            domain="xda-developers.com"
            postTitle="TypeScript has become the default across frontend frameworks"
            seed="a"
            source={{ name: 'XDA Developers', image: AVATAR }}
            text="TypeScript has become the default across frontend frameworks"
          />
        ),
      },
      {
        label: 'Very short (10 chars)',
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            domain="xda-developers.com"
            postTitle="Why the bundler war ended"
            seed="b"
            source={{ name: 'XDA Developers', image: AVATAR }}
            text="Tabs won."
          />
        ),
      },
      {
        label: `Over the cap (${LOREM.length} chars → truncated)`,
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            domain="xda-developers.com"
            postTitle="Why the bundler war ended"
            seed="c"
            source={{ name: 'XDA Developers', image: AVATAR }}
            text={LOREM}
          />
        ),
      },
      {
        label: 'Unbreakable strings',
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            seed="d"
            source={{ name: 'XDA Developers' }}
            text={UNBREAKABLE}
          />
        ),
      },
    ],
  },
  {
    id: 'post',
    title: 'Post',
    note: 'Title clamps at 4 lines, TLDR at 7. Both collapse when absent.',
    cases: [
      {
        label: 'Typical',
        node: (ref) => (
          <SnapshotFrame ref={ref} seed="post-a">
            <SnapshotContent
              avatar={{ name: 'XDA Developers', src: AVATAR }}
              body="A brief retrospective on how once-dominant tech and smartphone brands declined."
              meta={['Aug 24, 2026', '1m read time', 'xda-developers.com']}
              title="Why iconic tech brands like HTC and LG lost their dominance"
            />
          </SnapshotFrame>
        ),
      },
      {
        label: 'No TLDR, no source image',
        node: (ref) => (
          <SnapshotFrame ref={ref} seed="post-b">
            <SnapshotContent
              avatar={{ name: 'XDA Developers' }}
              meta={['Aug 24, 2026']}
              title="Why iconic tech brands like HTC and LG lost their dominance"
            />
          </SnapshotFrame>
        ),
      },
      {
        label: 'Overflowing title and TLDR',
        node: (ref) => (
          <SnapshotFrame ref={ref} seed="post-c">
            <SnapshotContent
              avatar={{ name: 'XDA Developers', src: AVATAR }}
              body={LOREM}
              meta={['Aug 24, 2026', '18m read time', 'a-very-long-domain-name.example.com']}
              title={LOREM}
            />
          </SnapshotFrame>
        ),
      },
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard rank',
    note: 'Stat row never wraps; large values shorten to K/M.',
    cases: [
      {
        label: 'Typical (#1)',
        node: (ref) => (
          <LeaderboardSnapshotCard
            ref={ref}
            board="Highest level"
            handle="@bobbyiliev"
            image={AVATAR}
            level={103}
            levelProgress={74}
            name="Bobby Iliev"
            rank={1}
            reputation={76800}
            score={15500}
            seed="lb-a"
          />
        ),
      },
      {
        label: 'Seven-digit values, level 1000, rank 48',
        node: (ref) => (
          <LeaderboardSnapshotCard
            ref={ref}
            board="Most achievement points"
            handle="@a-very-long-handle-indeed"
            image={AVATAR}
            level={1000}
            levelProgress={4}
            name="Someone With A Genuinely Very Long Display Name"
            rank={48}
            reputation={1284000}
            score={9250000}
            seed="lb-b"
          />
        ),
      },
      {
        label: 'Zeroes, no avatar',
        node: (ref) => (
          <LeaderboardSnapshotCard
            ref={ref}
            board="Longest streak"
            handle="@new"
            level={1}
            levelProgress={0}
            name="New Reader"
            rank={9}
            reputation={0}
            score={0}
            seed="lb-c"
          />
        ),
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profile',
    note: 'Cover falls back to a gradient band; bio collapses.',
    cases: [
      {
        label: 'Typical',
        node: (ref) => (
          <ProfileSnapshotCard
            ref={ref}
            bio="Building the place developers go to grow"
            handle="@tomer"
            image={AVATAR}
            joined="Jun 2021"
            name="Tomer Redlich"
            postsRead={4128}
            reputation={12400}
            seed="pr-a"
          />
        ),
      },
      {
        label: 'No cover, no bio, zeroes',
        node: (ref) => (
          <ProfileSnapshotCard
            ref={ref}
            handle="@brandnew"
            image={AVATAR}
            joined="Aug 2026"
            name="Brand New"
            postsRead={0}
            reputation={0}
            seed="pr-b"
          />
        ),
      },
      {
        label: 'Long name and bio, 7-digit reputation',
        node: (ref) => (
          <ProfileSnapshotCard
            ref={ref}
            bio={LOREM.slice(0, 160)}
            handle="@an-extremely-long-handle-that-keeps-going"
            image={AVATAR}
            joined="Jan 2015"
            name="Someone With A Genuinely Very Long Display Name"
            postsRead={182400}
            reputation={1284000}
            seed="pr-c"
          />
        ),
      },
    ],
  },
  {
    id: 'entity',
    title: 'Tag / source / squad',
    note: 'Tags use a hash tile; description collapses when absent.',
    cases: [
      {
        label: 'Tag, typical',
        node: (ref) => (
          <EntitySnapshotCard
            ref={ref}
            description="Everything happening in TypeScript."
            kind="tag"
            name="typescript"
            seed="en-a"
            stats={[
              { value: 48200, label: 'Followers' },
              { value: 1240, label: 'Posts' },
              { value: 96, label: 'This week' },
            ]}
          />
        ),
      },
      {
        label: 'Long tag, no description, one stat',
        node: (ref) => (
          <EntitySnapshotCard
            ref={ref}
            kind="tag"
            name="machine-learning-operations-and-observability"
            seed="en-b"
            stats={[{ value: 12, label: 'Posts' }]}
          />
        ),
      },
      {
        label: 'Source, no image',
        node: (ref) => (
          <EntitySnapshotCard
            ref={ref}
            description={LOREM.slice(0, 120)}
            handle="@a-source-with-a-long-handle"
            kind="source"
            name="A Source With A Considerably Longer Name Than Usual"
            seed="en-c"
            stats={[
              { value: 1284000, label: 'Followers' },
              { value: 86000, label: 'Posts' },
              { value: 340, label: 'This week' },
            ]}
          />
        ),
      },
    ],
  },
  {
    id: 'discussion',
    title: 'Discussion',
    note: `Comment truncates at ${SNAPSHOT_TEXT_LIMIT} characters, post title clamps at 2 lines.`,
    cases: [
      {
        label: 'Typical',
        node: (ref) => (
          <DiscussionSnapshotCard
            ref={ref}
            author={{ name: 'Ante Barić', handle: '@capjavert', image: AVATAR }}
            comment="The bundler war is over and nobody noticed."
            postTitle="Why iconic tech brands like HTC and LG lost their dominance"
            replies={24}
            seed="di-a"
            upvotes={186}
          />
        ),
      },
      {
        label: 'Long comment and title, no avatar',
        node: (ref) => (
          <DiscussionSnapshotCard
            ref={ref}
            author={{ name: 'Ante Barić', handle: '@capjavert' }}
            comment={LOREM}
            postTitle={LOREM.slice(0, 140)}
            replies={1840}
            seed="di-b"
            upvotes={26400}
          />
        ),
      },
    ],
  },
  {
    id: 'list',
    title: 'Briefing / best-of',
    note: 'Shows at most 5 rows; each title clamps at 2 lines.',
    cases: [
      {
        label: 'Five rows',
        node: (ref) => (
          <ListSnapshotCard
            ref={ref}
            eyebrow="Your briefing"
            items={[
              { title: 'Alibaba open-sources Qwen3.8-Max weights', meta: 'AI · 4m read' },
              { title: 'TypeScript 6.2 ships project-wide inference', meta: 'TypeScript · 6m read' },
              { title: 'The bundler war is over and nobody noticed', meta: 'Frontend · 3m read' },
              { title: 'Postgres 19 makes logical replication boring', meta: 'Databases · 8m read' },
              { title: 'What a decade of Rust taught us about ownership', meta: 'Rust · 11m read' },
            ]}
            seed="li-a"
            subtitle="Short briefing by @tomer"
            title="5 things worth your morning"
          />
        ),
      },
      {
        label: 'One row, no subtitle',
        node: (ref) => (
          <ListSnapshotCard
            ref={ref}
            eyebrow="Best of August"
            items={[{ title: 'The bundler war is over and nobody noticed' }]}
            seed="li-b"
            title="August's most upvoted read"
          />
        ),
      },
      {
        label: 'Overflowing titles',
        node: (ref) => (
          <ListSnapshotCard
            ref={ref}
            eyebrow="Your briefing"
            items={Array.from({ length: 5 }, (_, i) => ({
              title: LOREM.slice(0, 90 + i * 10),
              meta: UNBREAKABLE.slice(0, 40),
            }))}
            seed="li-c"
            subtitle={LOREM.slice(0, 70)}
            title={LOREM.slice(0, 80)}
          />
        ),
      },
    ],
  },
  {
    id: 'streak',
    title: 'Reading streak',
    note: 'Zero is meaningful here, so it renders rather than hides.',
    cases: [
      {
        label: 'Typical (100)',
        node: (ref) => (
          <StreakSnapshotCard
            ref={ref}
            days={100}
            longestStreak={100}
            milestone="A new personal best"
            seed="st-a"
            totalReadingDays={720}
            user={USER}
          />
        ),
      },
      {
        label: 'Day one, no milestone',
        node: (ref) => (
          <StreakSnapshotCard
            ref={ref}
            days={1}
            longestStreak={1}
            seed="st-b"
            totalReadingDays={1}
            user={USER}
          />
        ),
      },
      {
        label: 'Four digits',
        node: (ref) => (
          <StreakSnapshotCard
            ref={ref}
            days={1284}
            longestStreak={1284}
            milestone="Longer than daily.dev has existed"
            seed="st-c"
            totalReadingDays={2960}
            user={USER}
          />
        ),
      },
    ],
  },
  {
    id: 'invite',
    title: 'Invite',
    note: 'Perk collapses when there is no reward to offer.',
    cases: [
      {
        label: 'Typical',
        node: (ref) => (
          <InviteSnapshotCard
            ref={ref}
            handle="@tomer"
            headline="Come read with me on daily.dev"
            image={AVATAR}
            link="daily.dev/join/tomer"
            name="Tomer Redlich"
            perk="We both get a month of Plus"
            seed="in-a"
          />
        ),
      },
      {
        label: 'No perk, long name and link',
        node: (ref) => (
          <InviteSnapshotCard
            ref={ref}
            handle="@an-extremely-long-handle-that-keeps-going"
            headline="Come read with me on daily.dev"
            image={AVATAR}
            link="daily.dev/join/an-extremely-long-referral-token-value"
            name="Someone With A Genuinely Very Long Display Name"
            seed="in-b"
          />
        ),
      },
    ],
  },
  {
    id: 'achievement',
    title: 'Single achievement',
    note: 'Gold pill is reserved for sub-1%; art falls back to the card body.',
    cases: [
      {
        label: 'Sub-1% with art',
        node: (ref) => (
          <AchievementSnapshotCard
            ref={ref}
            completedAt="Jun 1"
            description="Spend 100,000 Cores without running dry."
            image="https://media.daily.dev/image/upload/s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all"
            name="Can't spend it all"
            rarity={0.01}
            seed="ac-a"
            tier={AchievementRarityTier.Emerald}
          />
        ),
      },
      {
        label: 'Common tier, no art, long copy',
        node: (ref) => (
          <AchievementSnapshotCard
            ref={ref}
            completedAt="Aug 26, 2024"
            description={LOREM.slice(0, 130)}
            name="An Achievement With A Considerably Longer Name"
            rarity={38}
            seed="ac-b"
            tier={AchievementRarityTier.Bronze}
          />
        ),
      },
    ],
  },
];

const Case = ({ spec }: { spec: CaseSpec }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [png, setPng] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const capture = async () => {
    if (!ref.current) {
      return;
    }

    setIsBusy(true);
    try {
      const blob = await captureShareImage(ref.current, {
        width: SNAPSHOT_SIZE,
        height: SNAPSHOT_SIZE,
        padding: 0,
        branded: false,
      });
      setPng(URL.createObjectURL(blob));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-text-tertiary typo-footnote">
        {spec.label}
      </figcaption>
      {/* Live DOM at scale: 40-odd states as real captures would take minutes,
          and the layout is identical either way. */}
      <div
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary"
        style={{ width: SNAPSHOT_SIZE * SCALE, height: SNAPSHOT_SIZE * SCALE }}
      >
        <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          {spec.node((node) => {
            ref.current = node;
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          loading={isBusy}
          disabled={isBusy}
          onClick={capture}
        >
          Capture PNG
        </Button>
        {png && (
          <a
            className="text-text-link typo-footnote"
            href={png}
            rel="noreferrer"
            target="_blank"
          >
            open 1080²
          </a>
        )}
      </div>
    </figure>
  );
};

const EdgeCases = () => (
  <div className="flex flex-col gap-10 p-8">
    <header className="flex flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-mega3">
        Snapshot edge cases
      </h1>
      <p className="max-w-[52rem] text-text-tertiary typo-body">
        Every card under the states that break layouts: nothing to show, far too
        much to show, unbreakable strings, and numbers with more digits than the
        design expected. Rendered live at {Math.round(SCALE * 100)}% — press
        Capture on any one to get the real 1080² PNG.
      </p>
    </header>

    {CARDS.map((card) => (
      <section key={card.id} className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold text-text-primary typo-title3">
            {card.title}
          </h2>
          <p className="text-text-tertiary typo-callout">{card.note}</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {card.cases.map((spec) => (
            <Case key={spec.label} spec={spec} />
          ))}
        </div>
      </section>
    ))}
  </div>
);

const meta: Meta<typeof EdgeCases> = {
  title: 'Features/Snapshot/Edge cases',
  component: EdgeCases,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AllStates: StoryObj<typeof EdgeCases> = {};
