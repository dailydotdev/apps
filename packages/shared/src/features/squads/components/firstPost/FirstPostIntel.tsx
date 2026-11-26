import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { EditIcon, MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';
import type { SquadIntelHighlights } from '../../../../graphql/squadIntel';
import {
  startupsLavender,
  startupsLavenderBorder,
  startupsLavenderWash,
} from '../../../../styles/custom';
import {
  formatIntelIndex,
  getIntelOpening,
  getIntelWeekLabel,
} from '../../lib/intel';
import { AgentMarks } from '../AgentPromptButton';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { SquadStatsRow } from '../valuePanel/SquadStatsRow';
import { formatMultiple, IntelBar, IntelSection } from './IntelSection';
import { IntelPostRow } from './IntelPostRow';
import { IntelTag, IntelText } from './IntelTag';
import {
  IntelDecayChart,
  IntelDiscussions,
  IntelMostBookmarked,
  IntelOnTheMove,
  IntelTagsAndLength,
  IntelTitles,
  IntelWhatGetsRead,
} from './FirstPostIntelSections';
import {
  competitionChipClassName,
  competitionFillClassName,
  competitionLabel,
} from './intelCompetition';

interface FirstPostIntelProps {
  intel: SquadIntelHighlights;
  name: string;
  editTopicsUrl: string;
  /** The prompt that starts the content skills, built on click */
  getAgentPrompt: () => string;
  onCopyPrompt?: () => void;
  upgradeUrl?: string;
  onUpgrade?: () => void;
  /** The free boost the first post gets, unset without one */
  boostDollars?: number;
  /** Opens the composer on a blank post */
  onWrite: () => void;
}

// Monday first, as the intel's days are
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const RISING_SHOWN = 3;

/** Rounded, as "38K": enough for scale, not an exact audience size */
const compact = (value: number): string =>
  value.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 0,
  });

const day = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

const formatChange = (change: number | null): string => {
  if (change === null) {
    return 'new';
  }

  return `${change > 0 ? '+' : ''}${change}%`;
};

const list = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : (items[0] ?? '');

const Change = ({ value }: { value: number | null }): ReactElement => (
  <span
    className={classNames(
      'w-12 shrink-0 text-right tabular-nums typo-footnote',
      (value === null || value > 0) && 'text-accent-avocado-default',
      value !== null && value < 0 && 'text-accent-ketchup-default',
      value === 0 && 'text-text-tertiary',
    )}
  >
    {formatChange(value)}
  </span>
);

/** A number against the average post, where 100 is the average */
const Index = ({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'shrink-0 text-right tabular-nums typo-footnote',
      value !== null && value >= 100 ? 'font-bold' : 'text-text-tertiary',
      className,
    )}
  >
    {value ?? '–'}
  </span>
);

const Head = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'shrink-0 text-text-tertiary typo-caption1',
      className,
    )}
  >
    {children}
  </span>
);

/** The intel's one action in the page's bar: start writing */
export const FirstPostIntelWrite = ({
  onWrite,
}: {
  /** Opens the composer on a blank post */
  onWrite: () => void;
}): ReactElement => (
  <Button
    type="button"
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
    icon={<EditIcon />}
    onClick={onWrite}
  >
    Write a post
  </Button>
);

/**
 * On top of the intel: hand all of it to their agent, which then helps them
 * get to the right post. It never writes the post.
 */
const AgentStrip = ({
  getPrompt,
  onCopy,
}: {
  getPrompt: () => string;
  onCopy?: () => void;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(getPrompt);

  return (
    <div className="flex flex-col gap-3 rounded-16 bg-surface-float p-4 tablet:flex-row tablet:items-center">
      <AgentMarks className="size-8 rounded-10" glyphClassName="size-5" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <strong className="typo-callout">Work on it with your agent</strong>
        <p className="text-pretty text-text-tertiary typo-footnote">
          It reads this intel, then plans what you publish, suggests post ideas
          or checks a post you wrote. You write the post.
        </p>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        className="shrink-0 self-start tablet:self-auto"
        onClick={() => {
          copy();
          onCopy?.();
        }}
      >
        {isCopying ? 'Copied' : 'Copy prompt'}
      </Button>
    </div>
  );
};

const HOUR_MS = 60 * 60 * 1000;
// Any Monday, to turn a UTC day and hour into the reader's own
const MONDAY_UTC = Date.UTC(2024, 0, 1);

const hourOf = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric' });

/** Monday (0) at 15 UTC as "Monday, 5 to 8 PM" in Israel */
const formatPublishSlot = (dayIndex: number, hour: number | null): string => {
  const start = new Date(MONDAY_UTC + (dayIndex * 24 + (hour ?? 12)) * HOUR_MS);
  const weekday = start.toLocaleDateString('en-US', { weekday: 'long' });
  if (hour === null) {
    return weekday;
  }
  const from = hourOf(start);
  const to = hourOf(new Date(start.getTime() + 3 * HOUR_MS));
  const sameHalf = from.slice(-2) === to.slice(-2);

  return `${weekday}, ${sameHalf ? from.slice(0, -3) : from} to ${to}`;
};

const DayBars = ({
  values,
  highlight,
  caption,
  getLabel,
  barsClassName = 'h-10',
}: {
  values: (number | null)[];
  highlight: number;
  caption: string;
  getLabel: (index: number) => string;
  barsClassName?: string;
}): ReactElement => {
  const max = Math.max(...values.map((value) => value ?? 0), 1);

  return (
    <figure className="flex w-full shrink-0 flex-col gap-1.5 tablet:w-56">
      <div className="flex gap-1">
        {values.map((value, index) => {
          const isHighlighted = index === highlight;

          return (
            <span
              key={DAYS[index]}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span
                className={classNames('flex w-full items-end', barsClassName)}
              >
                <span
                  className="w-full rounded-6"
                  style={{
                    height: `${Math.max(((value ?? 0) / max) * 100, 10)}%`,
                    background: isHighlighted
                      ? startupsLavender
                      : startupsLavenderBorder,
                  }}
                />
              </span>
              <span
                className={classNames(
                  'typo-caption2',
                  isHighlighted ? 'font-bold' : 'text-text-tertiary',
                )}
              >
                {getLabel(index)}
              </span>
            </span>
          );
        })}
      </div>
      <figcaption className="text-text-tertiary typo-caption2">
        {caption}
      </figcaption>
    </figure>
  );
};

/**
 * How the intel ends, with the last thing on the page starting the post.
 * Paid intel names the best time to publish. Free intel comes before a
 * page's first post, so it says today: their audience reads every day, and
 * a founder told to wait for a day might not post at all.
 */
const PublishNow = ({
  timing,
  showBestTime,
  boostDollars,
  onWrite,
}: {
  timing: SquadIntelHighlights['timing'];
  showBestTime: boolean;
  boostDollars?: number;
  onWrite: () => void;
}): ReactElement => {
  const today = (new Date().getDay() + 6) % 7;
  const bestIndex = Math.max(...timing.publishDays.map((value) => value ?? 0));
  const bestDay = bestIndex ? timing.publishDays.indexOf(bestIndex) : -1;
  const isBestTime = showBestTime && bestDay >= 0;
  const boostLine = boostDollars
    ? ` Your first post gets a free $${boostDollars} boost.`
    : '';

  return (
    <div
      className="flex flex-col gap-4 rounded-16 p-4 tablet:flex-row tablet:items-center tablet:p-5"
      style={{ background: startupsLavenderWash }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold typo-body">
            {isBestTime
              ? `The best time to publish is ${formatPublishSlot(
                  bestDay,
                  timing.bestHour,
                )}`
              : 'The best day to publish is today'}
          </h3>
          <p className="text-pretty text-text-secondary typo-footnote">
            {isBestTime
              ? `Posts in your topics that went out then got the most reads in their first 24 hours, over the last 4 weeks. Times are in your time zone.${boostLine}`
              : `Developers read your topics every day of the week, so no day is worth waiting for.${boostLine}`}
          </p>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<EditIcon />}
          className="self-start"
          onClick={onWrite}
        >
          Write a post
        </Button>
      </div>
      {isBestTime && (
        <DayBars
          values={timing.publishDays}
          highlight={bestDay}
          caption="First-day reads by the day a post went out"
          getLabel={(index) => DAYS[index]}
        />
      )}
      {!isBestTime && !!timing.days.length && (
        <DayBars
          values={timing.days.map(() => 1)}
          barsClassName="h-6"
          highlight={today}
          caption="Your audience reads every day"
          getLabel={(index) => (index === today ? 'Today' : DAYS[index])}
        />
      )}
    </div>
  );
};

/**
 * The page's weekly intel, drawn: the same four parts as the report that
 * paid pages read every Monday (your topics, what else your audience reads,
 * the top posts and timing), with the topic we would start from on top.
 */
export const FirstPostIntel = ({
  intel,
  name,
  editTopicsUrl,
  getAgentPrompt,
  onCopyPrompt,
  upgradeUrl,
  onUpgrade,
  boostDollars,
  onWrite,
}: FirstPostIntelProps): ReactElement => {
  const { topics, alsoRead, timing } = intel;
  const maxShare = Math.max(...topics.map(({ share }) => share), 1);
  const maxAffinity = Math.max(...alsoRead.map(({ affinity }) => affinity), 1);
  const opening = getIntelOpening(topics);
  // New tags first, then the ones that grew most
  const rising = [...alsoRead]
    .filter(({ change }) => change === null || change > 0)
    .sort((a, b) => (b.change ?? Infinity) - (a.change ?? Infinity))
    .slice(0, RISING_SHOWN)
    .map(({ tag, change }) => `#${tag} (${formatChange(change)})`);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 tablet:px-6">
      <AgentStrip getPrompt={getAgentPrompt} onCopy={onCopyPrompt} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-bold typo-title3">
              Last week in {name}&apos;s topics
            </h3>
            {intel.trial && <StartupsFreeChip label="One-time free" />}
            {intel.trial && upgradeUrl && (
              <a
                href={upgradeUrl}
                onClick={onUpgrade}
                className="ml-auto flex items-center gap-1 font-bold text-text-primary typo-footnote hover:underline"
              >
                Upgrade to keep it
                <MoveToIcon size={IconSize.Size16} className="shrink-0" />
              </a>
            )}
            {!intel.trial && (
              <a
                href={editTopicsUrl}
                className="ml-auto font-bold text-text-primary typo-footnote hover:underline"
              >
                Edit topics
              </a>
            )}
          </div>
          <p className="text-pretty text-text-tertiary typo-footnote">
            {intel.trial
              ? `What developers read on daily.dev, ${getIntelWeekLabel(intel)}, in the topics we picked from ${intel.trial.pickedFrom}. From ${day(intel.trial.endsAt)}, you get the general daily.dev trends instead.`
              : `What developers read on daily.dev, ${getIntelWeekLabel(intel)}.`}
          </p>
        </div>
        {intel.postsAnalyzed !== null && (
          <SquadStatsRow
            lead={{ label: 'Posts in your topics', value: intel.postsAnalyzed }}
            stats={[
              {
                label: 'Developers reading them',
                value: intel.readers ?? 0,
                text: compact(intel.readers ?? 0),
              },
              { label: 'Topics we track for you', value: topics.length },
            ]}
          />
        )}
        {opening && (
          <div
            className="flex flex-col gap-1 border-l-2 py-1 pl-4"
            style={{ borderColor: startupsLavender }}
          >
            <span className="text-text-tertiary typo-footnote">
              Our pick for your first post
            </span>
            <strong className="typo-title3">
              <IntelTag tag={opening.tag} /> is your opening
            </strong>
            <p className="text-pretty text-text-secondary typo-callout">
              {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
            </p>
          </div>
        )}
      </div>

      <IntelSection
        title="Where developers' attention went"
        hint="Share of the reads across your topics, and the change from the week before. Green is where few new posts compete."
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <Head className="w-24 tablet:w-32">Topic</Head>
            <Head className="min-w-0 flex-1">Share of attention</Head>
            <Head className="w-12 text-right">&nbsp;</Head>
            <Head className="w-12 text-right">Change</Head>
            <Head className="hidden w-12 text-right tablet:block">Reads</Head>
            <Head className="hidden w-16 text-right tablet:block">
              Bookmarks
            </Head>
            <Head className="hidden w-14 text-right tablet:block">Top 10%</Head>
            <Head className="hidden w-20 text-center tablet:block">
              Competition
            </Head>
          </div>
          <ul className="flex flex-col gap-2.5">
            {topics.map((topic) => (
              <li key={topic.tag} className="flex items-center gap-3">
                <span
                  className={classNames(
                    'w-24 shrink-0 truncate typo-footnote tablet:w-32',
                    topic.tag === opening?.tag && 'font-bold',
                  )}
                >
                  <IntelTag tag={topic.tag} />
                </span>
                <IntelBar
                  percentage={(topic.share / maxShare) * 100}
                  fillClassName={
                    topic.competition
                      ? competitionFillClassName[topic.competition]
                      : undefined
                  }
                />
                <span className="w-12 shrink-0 text-right font-bold tabular-nums typo-footnote">
                  {topic.share}%
                </span>
                <Change value={topic.change} />
                <Index
                  value={topic.readsPerPost}
                  className="hidden w-12 tablet:block"
                />
                <Index
                  value={topic.bookmarks}
                  className="hidden w-16 tablet:block"
                />
                <span className="hidden w-14 shrink-0 text-right tabular-nums text-text-tertiary typo-footnote tablet:block">
                  {topic.topPostsShare === null
                    ? '–'
                    : `${topic.topPostsShare}%`}
                </span>
                <span
                  className={classNames(
                    'hidden w-20 shrink-0 rounded-6 px-1.5 py-0.5 text-center font-bold typo-caption2 tablet:block',
                    topic.competition
                      ? competitionChipClassName[topic.competition]
                      : 'text-text-tertiary',
                  )}
                >
                  {topic.competition
                    ? competitionLabel[topic.competition]
                    : '–'}
                </span>
              </li>
            ))}
          </ul>
          <p className="hidden text-text-quaternary typo-caption1 tablet:block">
            Reads and bookmarks are an index: 100 is the average post in your
            topics. Top 10% is the share of a topic&apos;s reads that went to
            its top tenth of posts.
          </p>
        </div>
      </IntelSection>

      {!!alsoRead.length && (
        <IntelSection
          title="What else your audience reads"
          hint="Tags outside your topics, by how much more your audience reads them than everyone else."
        >
          <ul className="flex flex-col gap-2.5">
            {alsoRead.map((tag, index) => (
              <li key={tag.tag} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-center tabular-nums text-text-tertiary typo-footnote">
                  {index + 1}
                </span>
                <span className="w-24 shrink-0 truncate typo-footnote tablet:w-44">
                  <IntelTag tag={tag.tag} />
                </span>
                <IntelBar percentage={(tag.affinity / maxAffinity) * 100} />
                <span className="w-10 shrink-0 text-right font-bold tabular-nums typo-footnote">
                  {formatMultiple(tag.affinity)}
                </span>
                <span className="hidden w-28 shrink-0 text-right tabular-nums text-text-tertiary typo-footnote tablet:block">
                  {`read by ${tag.readBy}%`}
                </span>
                <Change value={tag.change} />
              </li>
            ))}
          </ul>
          {!!rising.length && !intel.risingTags.length && (
            <p className="text-text-secondary typo-footnote">
              <IntelText text={`Rising fastest: ${list(rising)}.`} />
            </p>
          )}
        </IntelSection>
      )}

      <IntelOnTheMove intel={intel} />
      <IntelWhatGetsRead intel={intel} />
      <IntelTitles intel={intel} />
      <IntelTagsAndLength intel={intel} />

      <IntelSection title="Top posts in your topics">
        <ol className="flex flex-col">
          {intel.topPosts.map((post, index) => (
            <IntelPostRow
              key={post.permalink}
              post={post}
              rank={index + 1}
              stat={`${formatMultiple(post.readsVsAverage)} the average reads`}
            />
          ))}
        </ol>
      </IntelSection>

      <IntelMostBookmarked intel={intel} />
      <IntelDiscussions intel={intel} />
      <IntelDecayChart intel={intel} />

      <PublishNow
        timing={timing}
        showBestTime={!intel.trial}
        boostDollars={boostDollars}
        onWrite={onWrite}
      />
    </div>
  );
};
