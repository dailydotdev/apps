import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DownloadIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  ART,
  AVATAR,
  Category,
  Control,
  Rail,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

/**
 * NewStreakModal: a reminder switch and close at the top, the fire art with
 * the count overlaid in typo-tera, a title, one line of copy, the freeze
 * upsell, and an opt-out checkbox. No share control, and no primary button.
 */
const StreakScreen = ({ spot }: { spot: 'today' | 'share' | 'milestone' }) => (
  <Screen>
    <div className="relative flex flex-col items-center gap-2 p-6 text-center">
      <div className="flex h-10 w-full items-center justify-between">
        <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
          <span className="h-4 w-7 rounded-8 bg-accent-cabbage-default" />
          Remind me
        </span>
        <Button
          aria-label="Close"
          icon={<MiniCloseIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <span className="relative flex items-center justify-center">
        <span className="text-[6rem] leading-none">🔥</span>
        <strong className="absolute text-text-primary typo-tera">100</strong>
      </span>

      <strong className="mt-6 text-text-primary typo-title1">
        {spot === 'milestone' ? 'New streak record!' : '100 days streak'}
      </strong>
      <p className="mt-3 text-text-secondary typo-body">
        {spot === 'milestone'
          ? 'Epic win! You are in a league of your own'
          : 'New milestone reached! You are unstoppable.'}
      </p>

      <span className="mt-6 text-text-link typo-footnote">
        Protect your streak with streak freezes
      </span>

      {spot !== 'today' && (
        <Control
          action="Snapshot"
          className="mt-6"
          label
          variant={ButtonVariant.Primary}
        />
      )}

      <span className="mt-6 flex items-center gap-2 text-text-tertiary typo-footnote">
        <span className="size-4 rounded-4 border border-border-subtlest-tertiary" />
        Never show this again
      </span>
    </div>
  </Screen>
);

/**
 * AchievementCard: a 48px thumbnail, name and description, then the snapshot
 * button and the points. The snapshot is `opacity-0 group-hover:opacity-100`,
 * so it is invisible until hover — and permanently invisible on touch.
 */
const AchievementScreen = ({
  spot,
}: {
  spot: 'today' | 'card' | 'celebration';
}) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      {spot === 'celebration' && (
        <span className="font-bold uppercase text-accent-cabbage-default typo-caption2">
          Just unlocked
        </span>
      )}

      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex items-start gap-3">
          <img alt="" className="size-12 shrink-0 rounded-12 object-cover" src={ART} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              Can&apos;t spend it all
            </span>
            <span className="mt-0.5 line-clamp-2 text-text-tertiary typo-footnote">
              Hold more than 10,000 cores without spending any of them.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 self-center">
            {spot !== 'today' && (
              <Control
                action="Snapshot"
                size={ButtonSize.XSmall}
                variant={
                  spot === 'celebration'
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
              />
            )}
            <span className="font-bold text-text-primary typo-callout">
              120
            </span>
          </div>
        </div>

        {spot !== 'celebration' && (
          <div className="flex flex-col gap-1">
            <span className="flex justify-between text-text-tertiary typo-footnote">
              <span>Progress</span>
              <span>8/10</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-14 bg-surface-invert">
              <span className="block h-full w-4/5 rounded-14 bg-accent-cabbage-default" />
            </span>
          </div>
        )}
      </div>
    </div>
  </Screen>
);

/**
 * UserTopList rows: a w-14 tabular score, TopRankBadge, an optional level
 * ring, then UserHighlight (32px avatar, caption1 name, caption2 handle).
 * The snapshot is `opacity-0 group-hover:opacity-100` at XSmall Float —
 * shipped, and invisible on touch.
 */
const RankScreen = ({ spot }: { spot: 'today' | 'hover' | 'band' }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      {spot === 'band' && (
        <div className="flex items-center gap-3 rounded-12 border border-accent-cabbage-default bg-overlay-float-cabbage p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              You&apos;re #1 this week
            </span>
            <span className="text-text-tertiary typo-caption1">
              Highest level · 103
            </span>
          </div>
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        </div>
      )}

      <h3 className="mb-2 font-bold text-text-primary typo-title3">
        Highest level
      </h3>

      <ol className="flex flex-col gap-1.5 typo-body">
        {[
          ['Bobby Iliev', 'bobbyiliev', 103],
          ['Ante Barić', 'antebaric', 99],
          ['Ido Shamun', 'idoshamun', 95],
        ].map(([name, handle, score], index) => (
          <li
            key={handle as string}
            className={`group flex w-full flex-row items-center rounded-8 px-2 ${
              index === 0 && spot === 'hover'
                ? 'bg-accent-pepper-subtler'
                : ''
            }`}
          >
            <span className="inline-flex w-14 shrink-0 justify-center tabular-nums text-text-quaternary">
              {score}
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center text-text-tertiary typo-caption1">
              {index === 0 ? '🥇' : `#${index + 1}`}
            </span>
            <div className="flex min-w-0 shrink items-center gap-2 p-2">
              <img
                alt=""
                className="size-8 rounded-full object-cover"
                src={AVATAR}
              />
              <div className="ml-2 flex min-w-0 flex-col">
                <span className="truncate text-text-primary typo-caption1">
                  {name}
                </span>
                <span className="truncate text-text-tertiary typo-caption2">
                  @{handle}
                </span>
              </div>
            </div>
            {index === 0 && spot === 'hover' && (
              <Control
                action="Snapshot"
                className="ml-auto"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Float}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  </Screen>
);


/* -------------------------------------------------- other win moments */

const TopReaderScreen = ({ share }: { share: boolean }) => (
  <Screen>
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="flex size-32 items-center justify-center rounded-16 bg-gradient-to-br from-accent-bacon-default to-accent-cabbage-default">
        <span className="text-[2.5rem]">🥇</span>
      </div>
      <h1 className="font-bold text-text-primary typo-title1">
        You&apos;ve earned the top reader badge!
      </h1>
      <p className="text-text-tertiary typo-callout">
        Top 1% of readers in #typescript this week
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Button
          icon={<DownloadIcon secondary />}
          size={ButtonSize.Small}
          variant={share ? ButtonVariant.Float : ButtonVariant.Primary}
        >
          Download badge
        </Button>
        {share && (
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        )}
      </div>
    </div>
  </Screen>
);

const TIER_DAYS = [
  ['Spark', 3],
  ['Flame', 7],
  ['Inferno', 30],
  ['Supernova', 180],
];

const StreakTierScreen = ({ share }: { share: boolean }) => (
  <Screen>
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-overlay-quaternary-bacon">
        <span className="text-[2.5rem]">🔥</span>
      </div>
      <span className="font-bold uppercase text-accent-bacon-default typo-caption2">
        Inferno
      </span>
      <strong className="text-text-primary typo-tera">30</strong>
      <h2 className="text-text-primary typo-title3">A full month, unbroken</h2>
      <div className="my-2 flex gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span
            key={`${day}-${index}`}
            className={`flex size-7 items-center justify-center rounded-full typo-caption1 ${
              index < 5
                ? 'bg-accent-bacon-default text-white'
                : 'bg-surface-float text-text-quaternary'
            }`}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {TIER_DAYS.map(([label, day]) => (
          <span
            key={label as string}
            className={`rounded-8 px-2 py-1 typo-caption2 ${
              label === 'Inferno'
                ? 'bg-accent-bacon-default text-white'
                : 'bg-surface-float text-text-tertiary'
            }`}
          >
            {label} · {day}d
          </span>
        ))}
      </div>
      {share && (
        <Control
          action="Snapshot"
          className="mt-3"
          label
          variant={ButtonVariant.Primary}
        />
      )}
    </div>
  </Screen>
);

/**
 * The award moment, from the recipient's side. ListAwardsModal shows who gave
 * what and the cores total; the person who received it gets no way to mark it.
 */
const AwardedScreen = ({ share }: { share: boolean }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary typo-title3">
          Awards given
        </span>
        <Button
          aria-label="Close"
          icon={<MiniCloseIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary py-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-bun text-[1.75rem]">
          🪙
        </span>
        <div className="flex flex-col">
          <span className="text-text-tertiary typo-body">Cores given</span>
          <span className="font-bold text-text-primary typo-title2">1,250</span>
        </div>
        {share && (
          <Control
            action="Snapshot"
            className="ml-auto"
            label
            variant={ButtonVariant.Primary}
          />
        )}
      </div>

      {['Bobby Iliev', 'Ante Barić', 'Ido Shamun'].map((name) => (
        <div key={name} className="flex items-center gap-3">
          <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
          <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
            {name}
          </span>
          <span className="text-xl">🏅</span>
        </div>
      ))}
    </div>
  </Screen>
);

const POST_STATS: [string, string][] = [
  ['Impressions', '41.2K'],
  ['Upvotes', '862'],
  ['Comments', '134'],
  ['Clicks', '3.8K'],
  ['Followers gained', '96'],
  ['Cores earned', '1,250'],
];

/** posts/[id]/analytics, behind canViewPostAnalytics. */
const AnalyticsScreen = ({ share }: { share: boolean }) => (
  <Screen>
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold uppercase text-text-quaternary typo-caption2">
            Post analytics
          </span>
          <span className="truncate font-bold text-text-primary typo-callout">
            Why iconic tech brands lost their dominance
          </span>
        </div>
        {share && <Control action="Snapshot" />}
      </div>

      <div className="h-20 rounded-12 bg-surface-float" />

      <div className="grid grid-cols-2 gap-2">
        {POST_STATS.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col rounded-12 bg-surface-float p-3"
          >
            <span className="font-bold text-text-primary typo-title3">
              {value}
            </span>
            <span className="text-text-tertiary typo-footnote">{label}</span>
          </div>
        ))}
      </div>

      {share && (
        <Control action="Snapshot" label variant={ButtonVariant.Primary} />
      )}
    </div>
  </Screen>
);

const StatusMoments = () => (
  <SurfacePage
    intro="Seven surfaces that share one property: there is no page to send anyone to. A link to your streak, your rank or your unlocked achievement means nothing to the person receiving it. Snapshot is not the louder option here — it is the only one."
    map="Sharing map: lead with Snapshot on all three (#6358 streak, #6360 achievements, #6359 rank). Copy link is not a secondary option, it is absent, because there is nothing to link to."
    title="Status moments"
  >
    <Category
      covers="#6358 · streak popup"
      title="Reading streak"
      verdict="Placement is settled; frequency is the real lever. Every day dulls it — 10 / 50 / 100 keeps it an event."
    >
      <Variant
        headline="A popup you dismiss"
        note="The milestone is announced and then thrown away."
        step="Today"
      >
        <StreakScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot beside Keep reading"
        note="Recommended. The number is the entire message, and the card is built to carry it at 168px."
        step="Recommended"
      >
        <StreakScreen spot="share" />
      </Variant>
      <Variant
        headline="Milestones only, with the framing to match"
        note="Same control, rarer trigger, better copy. ‘Your longest yet’ is a reason to share; ‘keep it going’ is a reason to close."
        step="Push"
      >
        <StreakScreen spot="milestone" />
      </Variant>
    </Category>

    <Category
      covers="#6360 · achievement cards and celebration moments"
      title="Achievements"
      verdict="The artwork is already designed to be looked at. The only question is whether we wait to be asked."
    >
      <Variant
        headline="Unlock, then nothing"
        note="The achievement lands in a grid and the moment passes unshared."
        step="Today"
      >
        <AchievementScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot on the card"
        note="Built and live. Overlaid on the artwork in Primary weight — Float disappears over a full-bleed image."
        step="Recommended"
      >
        <AchievementScreen spot="card" />
      </Variant>
      <Variant
        headline="The celebration opens itself"
        note="Highest-visibility option in the whole set: the offer arrives without being sought. Also the most interruptive, so gate it to rare unlocks."
        step="Push"
      >
        <AchievementScreen spot="celebration" />
      </Variant>
    </Category>

    <Category
      covers="#6359 · leaderboard row"
      title="Your leaderboard rank"
      verdict="The shipped control is `opacity-0 group-hover:opacity-100` at XSmall Float, pinned right with ml-auto. It works on desktop and does not exist on touch — the third hover-gated share control in the product, after the achievement card and the squad directory card."
    >
      <Variant
        headline="Nothing on your own row"
        note="Placing on a leaderboard is a status moment that currently ends in silence."
        step="Today"
      >
        <RankScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot revealed on your row"
        note="Built and live. The row is score, rank badge, avatar, name and handle; the snapshot fades in on the right. Clean on desktop, completely absent on mobile — which is most of the audience."
        step="Recommended"
      >
        <RankScreen spot="hover" />
      </Variant>
      <Variant
        headline="A rank band above the board"
        note="Works everywhere, states the offer outright, and names the achievement instead of making people infer it from a highlighted row."
        step="Push"
      >
        <RankScreen spot="band" />
      </Variant>
    </Category>
    <Category
      covers="TopReaderBadgeModal.tsx · StreakOfferCelebration.tsx · ListAwardsModal.tsx · posts/[id]/analytics"
      title="Win moments with no share route"
      verdict="Four more moments already ship, each one ending in a dismiss. All four are status with no destination, so snapshot is the only action that fits — the same argument as the streak and the achievement above."
    >
      <Variant
        headline="Top reader badge — download only"
        note="The clearest gap on this page. ‘You've earned the top reader badge!’ already generates an image server-side for the Download button, so the payload exists and nothing shares it. Same failure as the DevCard: generated, saved to a downloads folder, never posted."
        step="1 · Today"
      >
        <Rail>
          <TopReaderScreen share={false} />
          <TopReaderScreen share />
        </Rail>
      </Variant>
      <Variant
        headline="Streak tier milestones — ten of them, none shareable"
        note="streakTiers.ts defines Spark, Kindle, Flame, Blaze, Firestorm, Inferno, Scorcher, Eternal Flame, Supernova and Legendary, each with its own art, name and headline. Far richer than the plain day count we draw at the top of this page — and a named tier is more quotable than a number."
        step="2 · Today"
      >
        <Rail>
          <StreakTierScreen share={false} />
          <StreakTierScreen share />
        </Rail>
      </Variant>
      <Variant
        headline="Being awarded — the only win that came from someone else"
        note="Someone spent cores on your post. ListAwardsModal shows who gave what and the cores total, and the recipient gets no way to mark it. A win handed over by another person is usually more shareable, not less — and it names them, which gives the card a second reason to travel."
        step="3 · Today"
      >
        <Rail>
          <AwardedScreen share={false} />
          <AwardedScreen share />
        </Rail>
      </Variant>
      <Variant
        headline="A post that did well"
        note="posts/[id]/analytics already reports impressions, upvotes, clicks, comments, followers gained and cores earned, behind canViewPostAnalytics. ‘My post reached 41k developers’ is the most shareable sentence an author can say, and there is nowhere to say it. Two placements drawn: an icon in the header, and a labeled control under the stats where the numbers have just made the case."
        step="4 · Today"
      >
        <Rail>
          <AnalyticsScreen share={false} />
          <AnalyticsScreen share />
        </Rail>
      </Variant>
    </Category>

    <Category
      covers="found in code, not drawn"
      title="Three more worth a look"
      verdict="All three exist and end without a share. Listed rather than drawn, because each needs a call on whether the moment is worth interrupting before it is worth designing."
    >
      <Variant
        headline="The achievement unlock modal"
        note="AchievementCompletionModal shows the artwork, name, description and ‘+N points’, then offers ‘pick next’. It is the peak of the moment and the only way out is forward. Also worth catching: ‘You unlocked every achievement’ — a genuine flex with nothing attached to it."
        step="Unlock"
      >
        <div />
      </Variant>
      <Variant
        headline="Levelling up"
        note="Level is already the leaderboard's headline metric and QuestRewardAnimations fires a full reward animation, but crossing a level has no moment of its own. The leaderboard rank card we built is the closest thing, and it only exists if you happen to be on the board."
        step="Level"
      >
        <div />
      </Variant>
      <Variant
        headline="Curating the profile showcase"
        note="AchievementShowcaseModal lets you pick which achievements to feature. Choosing what to show off is a share trigger by definition — someone has just told us exactly which three things they are proudest of."
        step="Showcase"
      >
        <div />
      </Variant>
    </Category>

  </SurfacePage>
);

const meta: Meta<typeof StatusMoments> = {
  title: 'Features/Snapshot/Surfaces/Status moments',
  component: StatusMoments,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof StatusMoments> = {};
