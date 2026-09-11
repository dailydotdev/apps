import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { getSnapshotCaptureOptions } from '@dailydotdev/shared/src/features/snapshot/snapshotCapture';
import {
  findHighlightRange,
  SNAPSHOT_COPY_SIZE,
  SNAPSHOT_PASSAGE_LIMIT,
} from '@dailydotdev/shared/src/features/snapshot/snapshotText';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { ProfileSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotCard';
import { ListSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/ListSnapshotCard';
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

const LOREM =
  'The bundler war is over and nobody noticed, because we spent five entire years optimising cold starts while the actual bottleneck was always the four hundred kilobytes of analytics we shipped on every single page load, and no amount of tree shaking was ever going to fix a problem that lived in the product requirements rather than the build graph.';

/** Long enough that the highlight, sitting near the end, has to be windowed to. */
const LONG_PASSAGE = `Nobody set out to build it this way, and nobody in the room could have told you which meeting it started in. ${LOREM} ${LOREM} The honest version is that every one of those decisions was locally correct and the sum of them was not, which is the only interesting thing about it.`;

const UNBREAKABLE =
  'ReallyLongGenericTypeParameterNameThatNeverBreaks<TInput, TOutput> https://app.daily.dev/posts/some-extremely-long-slug-that-keeps-going-and-going';

const HIGHLIGHT_CONTEXT =
  'Every framework team arrived at the same answer within about eighteen months of each other. TypeScript has become the default across frontend frameworks, and the holdouts are now the ones explaining themselves rather than the other way around.';

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
    note: `The whole paragraph at one size (${SNAPSHOT_COPY_SIZE}px, the post card's), with the marked run picked out inside it. Over ${SNAPSHOT_PASSAGE_LIMIT} characters the passage is windowed around the highlight, cut at word boundaries. The frame grows or shrinks around it.`,
    cases: [
      {
        label: 'Typical (59 chars)',
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            seed="a"
            source={{ name: 'XDA Developers', image: AVATAR }}
            passage={HIGHLIGHT_CONTEXT}
            highlight={findHighlightRange(
              HIGHLIGHT_CONTEXT,
              'TypeScript has become the default across frontend frameworks',
            )}
          />
        ),
      },
      {
        label: 'Very short (10 chars)',
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            seed="b"
            source={{ name: 'XDA Developers', image: AVATAR }}
            passage="Tabs won. Prettier just hid the bodies, and every formatter argument since has been a proxy war over indentation."
            highlight={{ start: 0, end: 9 }}
          />
        ),
      },
      {
        label: `Over the cap (${LONG_PASSAGE.length} chars → windowed)`,
        node: (ref) => (
          <HighlightTextSnapshotCard
            ref={ref}
            seed="c"
            source={{ name: 'XDA Developers', image: AVATAR }}
            passage={LONG_PASSAGE}
            highlight={findHighlightRange(
              LONG_PASSAGE,
              'every one of those decisions was locally correct',
            )}
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
            passage={UNBREAKABLE}
            highlight={{ start: 0, end: UNBREAKABLE.indexOf(' ') }}
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
      const blob = await captureShareImage(
        ref.current,
        getSnapshotCaptureOptions(ref.current),
      );
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
          and the layout is identical either way. zoom, not transform: a growing
          frame has to push the preview box taller instead of being clipped. */}
      <div
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary"
        style={{ width: SNAPSHOT_SIZE * SCALE }}
      >
        <div style={{ zoom: SCALE }}>
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
