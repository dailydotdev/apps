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
import type {
  IntelCompetition,
  SquadIntelHighlights,
} from '../../../../graphql/squadIntel';
import { startupsLavender } from '../../../../styles/custom';
import {
  formatIntelIndex,
  getIntelOpening,
  getIntelWeekLabel,
} from '../../lib/intel';
import { AgentMarks } from '../AgentPromptButton';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { SquadStatsRow } from '../valuePanel/SquadStatsRow';
import { FirstPostIntelMap } from './FirstPostIntelMap';

interface FirstPostIntelProps {
  intel: SquadIntelHighlights;
  editTopicsUrl: string;
  /** The prompt that starts the content skills, built on click */
  getAgentPrompt: () => string;
  onCopyPrompt?: () => void;
  upgradeUrl?: string;
  onUpgrade?: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const RISING_SHOWN = 3;

const competitionLabel: Record<IntelCompetition, string> = {
  open: 'Open',
  moderate: 'Moderate',
  crowded: 'Crowded',
};

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
  isHighlighted,
}: {
  percentage: number;
  isHighlighted?: boolean;
}): ReactElement => (
  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-50 bg-border-subtlest-tertiary">
    <div
      className={classNames(
        'h-full rounded-50',
        !isHighlighted && 'bg-text-quaternary',
      )}
      style={{
        width: `${Math.max(percentage, 2)}%`,
        background: isHighlighted ? startupsLavender : undefined,
      }}
    />
  </div>
);

const Change = ({ value }: { value: number | null }): ReactElement => (
  <span
    className={classNames(
      'w-12 shrink-0 text-right tabular-nums typo-footnote',
      value === null || value > 0
        ? 'text-accent-avocado-default'
        : 'text-text-tertiary',
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
        <strong className="typo-callout">
          Give your agent everything on this page
        </strong>
        <p className="text-pretty text-text-tertiary typo-footnote">
          It reads this intel, then helps you pick an idea, plan what you
          publish or check your draft. You write the post.
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
        {isCopying ? 'Prompt copied' : 'Copy prompt'}
      </Button>
    </div>
  );
};

/**
 * Where the free issue turns into what a plan sends every week: the sections
 * under it are the weekly intel on the page's own topics.
 */
const FreeIssueLine = ({
  endsAt,
  upgradeUrl,
  onUpgrade,
}: {
  endsAt: string;
  upgradeUrl?: string;
  onUpgrade?: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <h3 className="font-bold typo-title3">Your weekly intel</h3>
      <StartupsFreeChip label="Free this once" />
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
      {`Everything from here down is on your own topics. After ${day(endsAt)}, a free page gets the general daily.dev trends instead.`}
    </p>
  </div>
);

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
  editTopicsUrl,
  getAgentPrompt,
  onCopyPrompt,
  upgradeUrl,
  onUpgrade,
}: FirstPostIntelProps): ReactElement => {
  const { topics, alsoRead, timing } = intel;
  const maxShare = Math.max(...topics.map(({ share }) => share), 1);
  const maxAffinity = Math.max(...alsoRead.map(({ affinity }) => affinity), 1);
  const maxDay = Math.max(...timing.days, 1);
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
            <h3 className="font-bold typo-title3">Overview</h3>
            {intel.trial && <StartupsFreeChip />}
            <a
              href={editTopicsUrl}
              className="ml-auto font-bold text-text-primary typo-footnote hover:underline"
            >
              Edit topics
            </a>
          </div>
          <p className="text-text-tertiary typo-footnote">
            {`Week of ${getIntelWeekLabel(intel)}`}
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
            <strong className="typo-title3">{`Write about #${opening.tag}`}</strong>
            <p className="text-pretty text-text-secondary typo-callout">
              {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
              {timing.bestDay &&
                timing.bestHours &&
                ` Publish on ${timing.bestDay}, ${timing.bestHours}.`}
            </p>
          </div>
        )}
      </div>

      {intel.trial && (
        <FreeIssueLine
          endsAt={intel.trial.endsAt}
          upgradeUrl={upgradeUrl}
          onUpgrade={onUpgrade}
        />
      )}

      <IntelSection
        title="Your topics"
        hint="Share of attention is the part of your audience's reads in your topics that went to each one. Change is against the week before."
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
            <Head className="hidden w-20 text-right tablet:block">
              Competition
            </Head>
          </div>
          <ul className="flex flex-col gap-2.5">
            {topics.map((topic) => (
              <li key={topic.tag} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate typo-footnote tablet:w-32">
                  #{topic.tag}
                </span>
                <IntelBar
                  percentage={(topic.share / maxShare) * 100}
                  isHighlighted={topic.tag === opening?.tag}
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
                    'hidden w-20 shrink-0 text-right typo-footnote tablet:block',
                    topic.competition === 'open'
                      ? 'font-bold'
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

      <IntelSection title="Top posts this week">
        <ol className="flex flex-col">
          {intel.topPosts.map((post, index) => (
            <PostRow key={post.permalink} post={post} rank={index + 1} />
          ))}
        </ol>
      </IntelSection>

      <IntelSection
        title="Timing"
        hint="When your audience reads, as a share of the week's reads."
      >
        <div className="flex items-end gap-2">
          {timing.days.map((share, index) => {
            const isBest = !!timing.bestDay?.startsWith(DAYS[index]);

            return (
              <div
                key={DAYS[index]}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={classNames(
                    'tabular-nums typo-caption1',
                    isBest ? 'font-bold' : 'text-text-tertiary',
                  )}
                >
                  {share}%
                </span>
                <span
                  className={classNames(
                    'w-full rounded-6',
                    !isBest && 'bg-border-subtlest-secondary',
                  )}
                  style={{
                    height: `${Math.max((share / maxDay) * 4, 0.25)}rem`,
                    background: isBest ? startupsLavender : undefined,
                  }}
                />
                <span
                  className={classNames(
                    'typo-caption1',
                    isBest ? 'font-bold' : 'text-text-tertiary',
                  )}
                >
                  {DAYS[index]}
                </span>
              </div>
            );
          })}
        </div>
        {timing.bestDay && timing.bestHours && (
          <p className="text-pretty text-text-secondary typo-callout">
            {`Posts published on ${timing.bestDay}, and posts published ${timing.bestHours}, get the strongest first day.`}
            {timing.weakestDay &&
              ` ${timing.weakestDay} is the weakest day to publish.`}
          </p>
        )}
      </IntelSection>
    </div>
  );
};
