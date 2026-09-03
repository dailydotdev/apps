import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CoreIcon,
  DownloadIcon,
  MiniCloseIcon,
  ShieldPlusIcon,
  SnapshotIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { TopRankBadge } from '@dailydotdev/shared/src/components/cards/Leaderboard/TopRankBadge';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';

/**
 * /dev/status-moments — internal review surface for the Snapshot sharing
 * initiative. Every screen below is a redraw of a real one; the reference is
 * named above each.
 */

const AVATAR =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

const ART =
  'https://media.daily.dev/image/upload/s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all';

/* ---------------------------------------------------------------- chrome */

/**
 * Inert on purpose: this page compares where a control sits inside a real
 * screen, not what it does when pressed.
 */
const Control = ({
  className,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
}: {
  className?: string;
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) => (
  <Button
    aria-label="Snapshot"
    className={className}
    icon={<SnapshotIcon />}
    size={size}
    variant={variant}
  >
    {label ? 'Snapshot' : undefined}
  </Button>
);

/** The frame every surface is drawn inside, so variants compare like for like. */
const Screen = ({ children }: { children: ReactNode }) => (
  <div className="w-[26rem] shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
    {children}
  </div>
);

/** Screens sit in a scroller rather than wrapping, so widths stay honest. */
const Rail = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full items-start gap-6 overflow-x-auto pb-3">
    {children}
  </div>
);

const Variant = ({
  step,
  headline,
  note,
  children,
}: {
  step: string;
  headline: string;
  note: string;
  children: ReactNode;
}) => (
  // Full width so a rail can scroll across the whole canvas.
  <div className="flex w-full flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {step}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {headline}
      </span>
      <span className="text-text-tertiary typo-footnote">{note}</span>
    </div>
    {children}
  </div>
);

const Category = ({
  title,
  covers,
  verdict,
  children,
}: {
  title: string;
  covers: string;
  verdict: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-10">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold text-text-primary typo-mega3">{title}</h2>
      <span className="text-text-tertiary typo-footnote">{covers}</span>
      <p className="max-w-[54rem] text-text-secondary typo-callout">
        {verdict}
      </p>
    </div>
    <div className="flex flex-col gap-10">{children}</div>
  </section>
);

/* --------------------------------------------------- streak celebration */

/** Day 30 on the streak ladder: milestone-rewards `data.ts`. */
const INFERNO = {
  art: '/streak-tiers/inferno.png',
  day: 30,
  headline: 'A full month, unbroken',
  label: 'Inferno',
  reward: '50 Cores',
};

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** The ember wash behind the flame, from `moment.tsx` PanelTone.Fire. */
const FIRE =
  'radial-gradient(120% 100% at 20% 0%, rgba(236,82,122,0.38) 0%, rgba(236,82,122,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(160deg, rgba(177,75,215,0.18) 0%, rgba(15,18,24,0) 60%)';

/**
 * The celebration half: tier art over a warm glow, the tier name, the count.
 * The embers and the staged entrance are dropped — this page compares control
 * placement, and a particle system on eleven screens is noise.
 */
const Celebration = () => (
  <div
    className="relative flex flex-col items-center gap-4 p-6 text-center"
    style={{ background: FIRE }}
  >
    <span className="relative flex size-32 items-center justify-center">
      <span
        aria-hidden
        className="opacity-70 absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(236,82,122,0.55) 0%, rgba(177,75,215,0.25) 45%, transparent 70%)',
        }}
      />
      <img
        alt=""
        className="relative size-32 object-contain"
        src={INFERNO.art}
        style={{ filter: 'drop-shadow(0 8px 34px rgba(236, 82, 122, 0.5))' }}
      />
    </span>

    <span className="w-fit rounded-8 bg-accent-bacon-default px-2 py-1 font-bold uppercase tracking-[0.16em] text-white typo-caption1">
      {INFERNO.label}
    </span>

    <div className="flex flex-col gap-1">
      <span className="flex items-baseline justify-center gap-2 text-text-primary">
        <strong className="font-bold tabular-nums typo-mega2">
          {INFERNO.day}
        </strong>
        <span className="font-normal typo-title3">day streak</span>
      </span>
      <h2 className="text-text-primary typo-title3">{INFERNO.headline}</h2>
    </div>

    <div className="flex items-center gap-1.5">
      {WEEK.map((day, index) => (
        <span
          key={`${day}-${WEEK.length - index}`}
          className="flex size-7 items-center justify-center rounded-full border border-accent-bacon-default text-text-primary typo-caption2"
          style={{ background: 'rgba(255, 131, 61, 0.18)' }}
        >
          {day}
        </span>
      ))}
    </div>
  </div>
);

/** The list primitive the decision column is built from. */
const OptionRow = ({
  action,
  icon,
  meta,
  primary,
  title,
}: {
  action: string;
  icon: ReactNode;
  meta: string;
  primary?: boolean;
  title: string;
}) => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2 pr-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-surface-hover text-text-tertiary">
      {icon}
    </span>
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-footnote">
        {title}
      </span>
      <span className="truncate text-text-quaternary typo-caption1">
        {meta}
      </span>
    </div>
    <Button
      className="shrink-0"
      size={ButtonSize.Small}
      type="button"
      variant={primary ? ButtonVariant.Primary : ButtonVariant.Secondary}
    >
      {action}
    </Button>
  </div>
);

/* -------------------------------------------------------------- surfaces */

/**
 * The streak milestone popup, redrawn from the milestone-rewards review
 * (Milestone Rewards/Final review, phone width): celebration panel above, one
 * decision column below.
 */
const StreakScreen = ({ spot }: { spot: 'today' | 'share' | 'milestone' }) => (
  <Screen>
    <div className="relative flex flex-col">
      <Button
        aria-label="Close"
        className="absolute right-4 top-4 z-2"
        icon={<MiniCloseIcon />}
        size={ButtonSize.Small}
        type="button"
        variant={ButtonVariant.Tertiary}
      />

      <Celebration />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-text-primary typo-title2">
            {spot === 'milestone'
              ? 'Your longest streak yet'
              : `Day ${INFERNO.day} unlocked`}
          </h3>
          <p className="text-text-tertiary typo-callout">
            Nothing sponsored today. This one is ours.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <OptionRow
            action="Claim"
            icon={<CoreIcon size={IconSize.Small} />}
            meta="Spend them on awards"
            primary
            title={INFERNO.reward}
          />
          <OptionRow
            action="Get"
            icon={<ShieldPlusIcon secondary size={IconSize.Small} />}
            meta="Covers a day you miss"
            title="Two streak freezes"
          />
        </div>

        {spot !== 'today' && (
          <Control
            label
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
          />
        )}

        <Button
          size={ButtonSize.Medium}
          type="button"
          variant={ButtonVariant.Float}
        >
          No thanks
        </Button>
      </div>
    </div>
  </Screen>
);

/** AchievementCard.tsx — the unlock card. */
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
          <img
            alt=""
            className="size-12 shrink-0 rounded-12 object-cover"
            src={ART}
          />
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
            <ProgressBar
              className={{
                wrapper: 'h-1.5 rounded-14 bg-surface-invert',
                bar: 'h-full rounded-14',
              }}
              percentage={80}
              shouldShowBg
            />
          </div>
        )}
      </div>
    </div>
  </Screen>
);

/** UserTopList.tsx — the leaderboard rows. */
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
          <Control label variant={ButtonVariant.Primary} />
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
              index === 0 && spot === 'hover' ? 'bg-accent-pepper-subtler' : ''
            }`}
          >
            <span className="inline-flex w-14 shrink-0 justify-center tabular-nums text-text-quaternary">
              {score}
            </span>
            <TopRankBadge rankIndex={index} />
            <div className="flex min-w-0 shrink items-center gap-2 p-2">
              <ProfilePicture
                rounded="full"
                size={ProfileImageSize.Medium}
                user={{ image: AVATAR, username: handle as string }}
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

/** TopReaderBadgeModal.tsx — download only, no share route. */
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
          type="button"
          variant={share ? ButtonVariant.Float : ButtonVariant.Primary}
        >
          Download badge
        </Button>
        {share && <Control label variant={ButtonVariant.Primary} />}
      </div>
    </div>
  </Screen>
);

/** The tier moment on its own: the celebration panel with no decision under it. */
const StreakTierScreen = ({ share }: { share: boolean }) => (
  <Screen>
    <Celebration />
    {share && (
      <div className="p-6 pt-0">
        <Control label variant={ButtonVariant.Primary} />
      </div>
    )}
  </Screen>
);

/** ListAwardsModal.tsx, from the recipient's side. */
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
          type="button"
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
          <Control className="ml-auto" label variant={ButtonVariant.Primary} />
        )}
      </div>

      {['Bobby Iliev', 'Ante Barić', 'Ido Shamun'].map((name) => (
        <div key={name} className="flex items-center gap-3">
          <ProfilePicture
            rounded="full"
            size={ProfileImageSize.Medium}
            user={{ image: AVATAR, username: name }}
          />
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
        {share && <Control />}
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

      {share && <Control label variant={ButtonVariant.Primary} />}
    </div>
  </Screen>
);

/* ------------------------------------------------------------------ page */

const ProductionGate = ({ children }: { children: ReactNode }) => {
  if (!isDevelopment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
        <p className="text-text-secondary typo-callout">
          The status moments review page is only available in development.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};

const StatusMomentsDevPage = (): ReactElement => (
  <ProductionGate>
    <NextSeo nofollow noindex title="Status moments · daily.dev dev" />
    <div className="min-h-screen bg-background-default">
      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-bold text-text-primary typo-mega3">
            Status moments
          </h1>
          <p className="max-w-[54rem] text-text-secondary typo-body">
            Seven surfaces that share one property: there is no page to send
            anyone to. A link to your streak, your rank or your unlocked
            achievement means nothing to the person receiving it. Snapshot is
            not the louder option here — it is the only one.
          </p>
          <p className="max-w-[54rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
            Sharing map: lead with Snapshot on all three (#6358 streak, #6360
            achievements, #6359 rank). Copy link is not a secondary option, it
            is absent, because there is nothing to link to.
          </p>
        </div>

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
            headline="Snapshot under the reward rows"
            note="Recommended. The number is the entire message, and the card is built to carry it at 168px. It sits under the decision rows, above No thanks, so it never competes with Claim."
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
          covers="TopReaderBadgeModal.tsx · milestone-rewards tier ladder · ListAwardsModal.tsx · posts/[id]/analytics"
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
            note="The milestone-rewards ladder gives every tier its own 3D flame, name and headline. The celebration panel is the whole card already — a named tier is more quotable than a number, and nothing currently shares it."
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
      </div>
    </div>
  </ProductionGate>
);

StatusMomentsDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default StatusMomentsDevPage;
