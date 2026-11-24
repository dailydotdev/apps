import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  DiscussIcon,
  EditIcon,
  LinkIcon,
  MoveToIcon,
  OpenLinkIcon,
  UpvoteIcon,
} from '../../../../components/icons';
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
import { FirstPostIntelMap } from './FirstPostIntelMap';
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

const number = (value: number): string => value.toLocaleString('en-US');

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

export const formatMultiple = (value: number): string =>
  `${value >= 10 ? Math.round(value) : value.toFixed(1)}×`;

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

export const IntelSection = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <h3 className="font-bold typo-body">{title}</h3>
      {hint && <p className="text-text-tertiary typo-footnote">{hint}</p>}
    </div>
    {children}
  </div>
);

export const IntelBar = ({
  percentage,
  fillClassName = 'bg-text-quaternary',
}: {
  percentage: number;
  fillClassName?: string;
}): ReactElement => (
  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-50 bg-border-subtlest-tertiary">
    <div
      className={classNames('h-full rounded-50', fillClassName)}
      style={{ width: `${Math.max(percentage, 2)}%` }}
    />
  </div>
);

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

/**
 * Where the free issue turns into what a plan sends every week: the sections
 * under it are the weekly intel on the page's own topics.
 */
const FreeIssueLine = ({
  name,
  pickedFrom,
  endsAt,
  upgradeUrl,
  onUpgrade,
}: {
  name: string;
  pickedFrom: string;
  endsAt: string;
  upgradeUrl?: string;
  onUpgrade?: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <h3 className="font-bold typo-title3">Your weekly intel</h3>
      <StartupsFreeChip label="One-time free" />
      {upgradeUrl && (
        <a
          href={upgradeUrl}
          onClick={onUpgrade}
          className="ml-auto flex items-center gap-1 font-bold text-text-primary typo-footnote hover:underline"
        >
          Upgrade your plan to keep it
          <MoveToIcon size={IconSize.Size16} className="shrink-0" />
        </a>
      )}
    </div>
    <p className="text-pretty text-text-tertiary typo-footnote">
      {`We picked ${name}'s topics from ${pickedFrom} for this one. From ${day(endsAt)}, you get the general daily.dev trends instead.`}
    </p>
  </div>
);

/**
 * How the intel ends: their audience reads every day, so no day is worth
 * waiting for, and the last thing on the page starts the post.
 */
const PublishNow = ({
  days,
  boostDollars,
  onWrite,
}: {
  /** Share of the week's reads by day, Monday first */
  days: number[];
  boostDollars?: number;
  onWrite: () => void;
}): ReactElement => {
  const today = (new Date().getDay() + 6) % 7;

  return (
    <div
      className="flex flex-col gap-4 rounded-16 p-4 tablet:flex-row tablet:items-center tablet:p-5"
      style={{ background: startupsLavenderWash }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold typo-body">
            The best day to publish is today
          </h3>
          <p className="text-pretty text-text-secondary typo-footnote">
            Developers read your topics every day of the week, so no day is
            worth waiting for.
            {!!boostDollars &&
              ` Your first post gets a free $${boostDollars} boost.`}
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
      {!!days.length && (
        <figure className="flex w-full shrink-0 flex-col gap-1.5 tablet:w-56">
          <div className="flex gap-1">
            {days.map((share, index) => {
              const isToday = index === today;

              return (
                <span
                  key={DAYS[index]}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <span
                    className="h-6 w-full rounded-6"
                    style={{
                      background: isToday
                        ? startupsLavender
                        : startupsLavenderBorder,
                    }}
                  />
                  <span
                    className={classNames(
                      'typo-caption2',
                      isToday ? 'font-bold' : 'text-text-tertiary',
                    )}
                  >
                    {isToday ? 'Today' : DAYS[index]}
                  </span>
                </span>
              );
            })}
          </div>
          <figcaption className="text-text-tertiary typo-caption2">
            Your audience reads every day
          </figcaption>
        </figure>
      )}
    </div>
  );
};

type TopPost = SquadIntelHighlights['topPosts'][number];

/** A post as a place to go: its picture, its title as a link, how it did */
const PostRow = ({
  post,
  rank,
}: {
  post: TopPost;
  rank: number;
}): ReactElement => (
  <li>
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener"
      className="group -mx-2 flex items-center gap-3 rounded-12 p-2 hover:bg-surface-float"
    >
      <span className="w-4 shrink-0 text-center tabular-nums text-text-tertiary typo-footnote">
        {rank}
      </span>
      {post.image ? (
        <img
          src={post.image}
          alt=""
          className="h-12 w-20 shrink-0 rounded-8 object-cover"
        />
      ) : (
        <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary group-hover:bg-surface-hover">
          <LinkIcon size={IconSize.Small} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 font-bold typo-callout group-hover:underline">
          {post.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
          <span>{post.source}</span>
          <strong className="text-text-primary">
            {`${formatMultiple(post.readsVsAverage)} the average reads`}
          </strong>
          <span className="flex items-center gap-1">
            <UpvoteIcon size={IconSize.Size16} />
            {number(post.upvotes)}
          </span>
          <span className="flex items-center gap-1">
            <DiscussIcon size={IconSize.Size16} />
            {number(post.comments)}
          </span>
        </span>
      </span>
      <OpenLinkIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary group-hover:text-text-primary"
      />
    </a>
  </li>
);

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
            {intel.trial && <StartupsFreeChip />}
            <a
              href={editTopicsUrl}
              className="ml-auto font-bold text-text-primary typo-footnote hover:underline"
            >
              Edit topics
            </a>
          </div>
          <p className="text-text-tertiary typo-footnote">
            {`What developers read on daily.dev, ${getIntelWeekLabel(intel)}.`}
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
            <strong className="typo-title3">{`#${opening.tag} is your opening`}</strong>
            <p className="text-pretty text-text-secondary typo-callout">
              {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
            </p>
          </div>
        )}
      </div>

      {intel.trial && (
        <FreeIssueLine
          name={name}
          pickedFrom={intel.trial.pickedFrom}
          endsAt={intel.trial.endsAt}
          upgradeUrl={upgradeUrl}
          onUpgrade={onUpgrade}
        />
      )}

      <IntelSection
        title="Where developers' attention went"
        hint="Share of the reads across your topics, and the change from the week before. Green is where few new posts compete."
      >
        <FirstPostIntelMap topics={topics} openingTag={opening?.tag} />
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
                  #{topic.tag}
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
                  #{tag.tag}
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
          {!!rising.length && (
            <p className="text-text-secondary typo-footnote">
              {`Rising fastest: ${list(rising)}.`}
            </p>
          )}
        </IntelSection>
      )}

      <IntelSection title="Top posts in your topics">
        <ol className="flex flex-col">
          {intel.topPosts.map((post, index) => (
            <PostRow key={post.permalink} post={post} rank={index + 1} />
          ))}
        </ol>
      </IntelSection>

      <PublishNow
        days={timing.days}
        boostDollars={boostDollars}
        onWrite={onWrite}
      />
    </div>
  );
};
