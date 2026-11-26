import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import type {
  IntelDecay,
  IntelIndexRow,
  SquadIntelHighlights,
} from '../../../../graphql/squadIntel';
import { startupsLavender } from '../../../../styles/custom';
import { formatIntelIndex } from '../../lib/intel';
import { IntelPostRow } from './IntelPostRow';
import { formatMultiple, IntelBar, IntelSection } from './IntelSection';
import { IntelTag, IntelText } from './IntelTag';
import type { NamedIntelRow } from './intelLabels';
import { nameIntelRows } from './intelLabels';

const ROWS_SHOWN = 6;

const number = (value: number): string => value.toLocaleString('en-US');

type ReadRow = NamedIntelRow & { reads: number };

/** Rows the page shows with enough posts to tell, most reads per post first */
const byReads = (rows: IntelIndexRow[]): ReadRow[] =>
  nameIntelRows(rows)
    .filter((row): row is ReadRow => row.reads !== null)
    .sort((a, b) => b.reads - a.reads);

const RowName = ({ row }: { row: NamedIntelRow }): ReactElement => {
  const name = (
    <span
      className={classNames(
        'w-36 shrink-0 truncate typo-footnote tablet:w-56',
        row.hint &&
          'cursor-help underline decoration-text-quaternary decoration-dotted underline-offset-4',
      )}
    >
      <IntelText text={row.name} />
    </span>
  );

  return row.hint ? (
    <Tooltip content={row.hint} enableMobileClick>
      {name}
    </Tooltip>
  ) : (
    name
  );
};

/**
 * Kinds of posts by reads per post against the average post, as "2.3x",
 * with the post count each number comes from. Long lists open on demand.
 */
const IndexRows = ({
  rows,
  limit = ROWS_SHOWN,
  sorted: isSorted = true,
}: {
  rows: IntelIndexRow[];
  limit?: number;
  /** False keeps the intel's own order, as for lengths */
  sorted?: boolean;
}): ReactElement | null => {
  const [isOpen, setOpen] = useState(false);
  const shown = isSorted
    ? byReads(rows)
    : nameIntelRows(rows).filter((row): row is ReadRow => row.reads !== null);
  const max = Math.max(...shown.map(({ reads }) => reads), 100);

  if (!shown.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2.5">
        {(isOpen ? shown : shown.slice(0, limit)).map((row) => (
          <li key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <RowName row={row} />
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
              <span className="truncate text-text-tertiary typo-caption1">
                {`"${row.example}"`}
              </span>
            )}
          </li>
        ))}
      </ul>
      {shown.length > limit && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          className="self-start"
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? 'Show fewer' : `Show all ${shown.length}`}
        </Button>
      )}
    </div>
  );
};

/** One line on which row did best, as "Hot take posts got 3.9x the reads" */
const bestOf = (rows: IntelIndexRow[], noun: string): string | null => {
  const [best] = byReads(rows);

  return best && best.reads > 100
    ? `${best.name} ${noun} got ${formatIntelIndex(best.reads)} the average reads per post.`
    : null;
};

const Takeaway = ({ text }: { text: string | null }): ReactElement | null =>
  text ? (
    <p className="text-pretty text-text-secondary typo-callout">{text}</p>
  ) : null;

const Subsection = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement => (
  <div className="flex flex-col gap-2 pt-2">
    <h4 className="font-bold typo-footnote">{title}</h4>
    {children}
  </div>
);

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
        <IntelTag tag={tag} className="font-bold" />
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
        <div className="flex flex-col gap-2">
          <h4 className="font-bold typo-footnote">New this week</h4>
          <TagChips tags={newTags.map((tag) => ({ tag, detail: 'new' }))} />
        </div>
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
      hint="Reads per post against the average post in your topics. Green is above average. Hover a name to see what it means."
    >
      <IndexRows rows={intel.formats} />
      <Takeaway text={bestOf(intel.formats, 'posts')} />
      {!!byReads(intel.properties).length && (
        <Subsection title="What the post is like">
          <IndexRows rows={intel.properties} />
        </Subsection>
      )}
      {!!byReads(intel.nativePosts).length && (
        <Subsection title="What the post has">
          <IndexRows rows={intel.nativePosts} />
        </Subsection>
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
        <Subsection title="Title length">
          <IndexRows rows={intel.titleLengths} sorted={false} />
        </Subsection>
      )}
    </IntelSection>
  ) : null;

/** Which tags to put together, and how long the post should take to read */
export const IntelTagsAndLength = ({
  intel,
}: {
  intel: SquadIntelHighlights;
}): ReactElement | null => {
  const pairs = [...intel.tagPairs.above, ...intel.tagPairs.below];

  if (!byReads(pairs).length && !byReads(intel.readTime).length) {
    return null;
  }

  return (
    <IntelSection
      title="Tags and length"
      hint="Reads per post by the pair of your topics a post is tagged with, and by how long it takes to read."
    >
      {!!byReads(pairs).length && <IndexRows rows={pairs} />}
      {!!byReads(intel.readTime).length && (
        <Subsection title="Read time">
          <IndexRows rows={intel.readTime} sorted={false} />
        </Subsection>
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
      <ol className="flex flex-col">
        {intel.mostBookmarked.map((post, index) => (
          <IntelPostRow
            key={post.permalink}
            post={post}
            rank={index + 1}
            stat={`${formatMultiple(post.bookmarkRateVsAverage)} the average Bookmarks`}
          />
        ))}
      </ol>
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
      <ol className="flex flex-col">
        {intel.discussions.map((post, index) => (
          <IntelPostRow key={post.permalink} post={post} rank={index + 1}>
            <span
              className="mt-1 line-clamp-3 text-pretty border-l-2 pl-3 text-text-secondary typo-footnote"
              style={{ borderColor: startupsLavender }}
            >
              {`"${post.comment}"`}
            </span>
          </IntelPostRow>
        ))}
      </ol>
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
              <IntelTag tag={topic.tag} />
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
