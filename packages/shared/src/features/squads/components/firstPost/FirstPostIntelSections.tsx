import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import type {
  IntelDecay,
  IntelIndexRow,
  SquadIntelHighlights,
} from '../../../../graphql/squadIntel';
import { startupsLavender } from '../../../../styles/custom';
import { formatIntelIndex } from '../../lib/intel';
import { formatMultiple, IntelBar, IntelSection } from './IntelSection';

const ROWS_SHOWN = 6;

const number = (value: number): string => value.toLocaleString('en-US');

const list = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : (items[0] ?? '');

type ReadRow = IntelIndexRow & { reads: number };

/** Rows with enough posts to tell, most reads per post first */
const byReads = (rows: IntelIndexRow[]): ReadRow[] =>
  rows
    .filter((row): row is ReadRow => row.reads !== null)
    .sort((a, b) => b.reads - a.reads);

/**
 * Kinds of posts by reads per post against the average post, as "2.3x",
 * with the post count each number comes from. Long lists open on demand.
 */
const IndexRows = ({
  rows,
  limit = ROWS_SHOWN,
}: {
  rows: IntelIndexRow[];
  limit?: number;
}): ReactElement | null => {
  const [isOpen, setOpen] = useState(false);
  const sorted = byReads(rows);
  const max = Math.max(...sorted.map(({ reads }) => reads), 100);

  if (!sorted.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2.5">
        {(isOpen ? sorted : sorted.slice(0, limit)).map((row) => (
          <li key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate typo-footnote tablet:w-56">
                {row.label}
              </span>
              <IntelBar
                percentage={(row.reads / max) * 100}
                fillClassName={
                  row.reads >= 100
                    ? 'bg-accent-avocado-default'
                    : 'bg-text-quaternary'
                }
              />
              <span
                className={classNames(
                  'w-10 shrink-0 text-right tabular-nums typo-footnote',
                  row.reads >= 100 ? 'font-bold' : 'text-text-tertiary',
                )}
              >
                {formatIntelIndex(row.reads)}
              </span>
              <span className="hidden w-20 shrink-0 text-right tabular-nums text-text-quaternary typo-caption1 tablet:block">
                {`${number(row.posts)} posts`}
              </span>
            </div>
            {row.example && (
              <span className="truncate pl-0 text-text-tertiary typo-caption1">
                {`"${row.example}"`}
              </span>
            )}
          </li>
        ))}
      </ul>
      {sorted.length > limit && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          className="self-start"
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? 'Show fewer' : `Show all ${sorted.length}`}
        </Button>
      )}
    </div>
  );
};

/** One line on which row did best, as "Hot take posts got 3.9x the reads" */
const bestOf = (rows: IntelIndexRow[], noun: string): string | null => {
  const [best] = byReads(rows);

  return best && best.reads > 100
    ? `${best.label} ${noun} got ${formatIntelIndex(best.reads)} the average reads per post.`
    : null;
};

const Takeaway = ({ text }: { text: string | null }): ReactElement | null =>
  text ? (
    <p className="text-pretty text-text-secondary typo-callout">{text}</p>
  ) : null;

export const TagChips = ({
  tags,
}: {
  tags: { tag: string; detail: string }[];
}): ReactElement => (
  <ul className="flex flex-wrap gap-2">
    {tags.map(({ tag, detail }) => (
      <li
        key={tag}
        className="flex items-baseline gap-1.5 rounded-10 bg-surface-float px-2.5 py-1 typo-footnote"
      >
        <span className="font-bold">#{tag}</span>
        <span className="tabular-nums text-text-tertiary">{detail}</span>
      </li>
    ))}
  </ul>
);

/** Topics on the move next to the page's own: rising, new, and open ground */
export const IntelOnTheMove = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null => {
  const { risingTags, newTags, fewPostsManyReaders } = intel;

  if (!risingTags.length && !newTags.length && !fewPostsManyReaders.length) {
    return null;
  }

  return (
    <IntelSection
      title="Topics on the move"
      hint="Tags your audience read this week that are growing fast, new, or have few posts for the readers they get."
    >
      {!!fewPostsManyReaders.length && (
        <div className="flex flex-col gap-2">
          <h4 className="font-bold typo-footnote">Few posts, many readers</h4>
          <TagChips
            tags={fewPostsManyReaders.map(({ tag, reads, posts }) => ({
              tag,
              detail: `${formatIntelIndex(reads)} reads, ${posts} posts`,
            }))}
          />
        </div>
      )}
      {!!risingTags.length && (
        <div className="flex flex-col gap-2">
          <h4 className="font-bold typo-footnote">Rising fastest</h4>
          <TagChips
            tags={risingTags.map(({ tag, change }) => ({
              tag,
              detail: `+${number(change)}%`,
            }))}
          />
        </div>
      )}
      {!!newTags.length && (
        <p className="text-text-secondary typo-footnote">
          {`New this week: ${list(newTags.map((tag) => `#${tag}`))}.`}
        </p>
      )}
    </IntelSection>
  );
};

/** What kind of post to write: its format and what it is like */
export const IntelWhatGetsRead = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null =>
  byReads(intel.formats).length ? (
    <IntelSection
      title="What gets read"
      hint="Reads per post against the average post in your topics. Green is above average."
    >
      <IndexRows rows={intel.formats} />
      <Takeaway text={bestOf(intel.formats, 'posts')} />
      {!!byReads(intel.properties).length && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-bold typo-footnote">What the post is like</h4>
          <IndexRows rows={intel.properties} />
        </div>
      )}
    </IntelSection>
  ) : null;

export const IntelTitles = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null =>
  byReads(intel.titleTypes).length ? (
    <IntelSection
      title="Titles that get read"
      hint="Reads per post by what the title has in it, with a real title of each kind."
    >
      <IndexRows rows={intel.titleTypes} limit={5} />
      {!!byReads(intel.titleLengths).length && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-bold typo-footnote">Title length</h4>
          <IndexRows rows={intel.titleLengths} />
        </div>
      )}
    </IntelSection>
  ) : null;

/** Where and how a post goes out: on daily.dev or linked, tags, length */
export const IntelHowItsPosted = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null => {
  const { publishing, nativePosts, tagPairs, readTime } = intel;
  const pairs = [...tagPairs.above, ...tagPairs.below];

  if (
    !byReads(publishing).length &&
    !byReads(readTime).length &&
    !byReads(pairs).length
  ) {
    return null;
  }

  return (
    <IntelSection
      title="How it's posted"
      hint="Reads per post by where the post lives, its tags and its length."
    >
      <IndexRows rows={publishing} />
      {!!byReads(nativePosts).length && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-bold typo-footnote">
            Posts written on daily.dev, by what is in them
          </h4>
          <IndexRows rows={nativePosts} />
        </div>
      )}
      {!!byReads(pairs).length && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-bold typo-footnote">Tag pairs</h4>
          <IndexRows rows={pairs} />
        </div>
      )}
      {!!byReads(readTime).length && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-bold typo-footnote">Read time</h4>
          <IndexRows rows={readTime} />
        </div>
      )}
    </IntelSection>
  );
};

export const IntelMostBookmarked = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null =>
  intel.mostBookmarked.length ? (
    <IntelSection
      title="Bookmarked most"
      hint="Posts saved for later most often, against the average bookmark rate."
    >
      <ul className="flex flex-col gap-2">
        {intel.mostBookmarked.map((post) => (
          <li key={post.permalink} className="flex items-baseline gap-3">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener"
              className="min-w-0 flex-1 font-bold typo-callout hover:underline"
            >
              {post.title}
            </a>
            <span className="shrink-0 font-bold tabular-nums typo-footnote">
              {formatMultiple(post.bookmarkRateVsAverage)}
            </span>
          </li>
        ))}
      </ul>
    </IntelSection>
  ) : null;

export const IntelDiscussions = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null =>
  intel.discussions.length ? (
    <IntelSection
      title="What your audience discussed"
      hint="A top comment from the posts your audience talked about most."
    >
      <ul className="flex flex-col gap-4">
        {intel.discussions.map((post) => (
          <li
            key={post.permalink}
            className="flex flex-col gap-1.5 border-l-2 pl-4"
            style={{ borderColor: startupsLavender }}
          >
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener"
              className="font-bold typo-callout hover:underline"
            >
              {post.title}
            </a>
            <p className="line-clamp-3 text-pretty text-text-secondary typo-footnote">
              {`"${post.comment}"`}
            </p>
          </li>
        ))}
      </ul>
    </IntelSection>
  ) : null;

const DECAY_PARTS: { key: keyof Omit<IntelDecay, 'tag'>; label: string }[] = [
  { key: 'day1', label: 'Day 1' },
  { key: 'days2to3', label: 'Days 2 to 3' },
  { key: 'days4to7', label: 'Days 4 to 7' },
  { key: 'days8to14', label: 'Days 8 to 14' },
];

const DECAY_OPACITY = [1, 0.7, 0.45, 0.25];

/** How long a post keeps getting read: no rush, reads keep coming for days */
export const IntelDecayChart = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null =>
  intel.decay.length ? (
    <IntelSection
      title="How long posts keep getting read"
      hint="The share of a post's first 14 days of reads that came in each period."
    >
      <ul className="flex flex-col gap-2.5">
        {intel.decay.map((topic) => (
          <li key={topic.tag} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate typo-footnote tablet:w-32">
              #{topic.tag}
            </span>
            <span className="flex h-3 min-w-0 flex-1 overflow-hidden rounded-50">
              {DECAY_PARTS.map(({ key, label }, index) => (
                <span
                  key={key}
                  title={`${label}: ${topic[key]}%`}
                  className="h-full"
                  style={{
                    width: `${topic[key]}%`,
                    background: startupsLavender,
                    opacity: DECAY_OPACITY[index],
                  }}
                />
              ))}
            </span>
            <span className="w-16 shrink-0 text-right tabular-nums text-text-tertiary typo-footnote">
              {`${100 - topic.day1}% later`}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-tertiary typo-caption1">
        {DECAY_PARTS.map(({ key, label }, index) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{
                background: startupsLavender,
                opacity: DECAY_OPACITY[index],
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </IntelSection>
  ) : null;
