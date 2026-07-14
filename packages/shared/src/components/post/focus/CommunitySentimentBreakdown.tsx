import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { HotIcon, OpenLinkIcon, ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { anchorDefaultRel } from '../../../lib/strings';
import { largeNumberFormat } from '../../../lib/numberFormat';
import type {
  CommunitySentimentData,
  CommunitySentimentDiscussion,
  SentimentHighlight,
  SourceLean,
  SourceSentiment,
} from './CommunitySentiment';

// Maps the by-source narrative's friendly name to the discussion payload's
// machine-friendly provider id, so raw counts can be attached to the right row.
const SOURCE_TO_PROVIDER: Record<string, string> = {
  'Hacker News': 'hackernews',
  Lobsters: 'lobsters',
  X: 'x',
};

const formatDiscussionCount = (value: number): string =>
  largeNumberFormat(value)?.toLowerCase() ?? `${value}`;

// Authentic-enough source marks: HN's real logo is an orange "Y" square, X the
// glyph, Lobsters a red square. `color` omitted => theme-adaptive mono badge.
const SOURCE_BADGE: Record<string, { label: string; color?: string }> = {
  X: { label: '𝕏' },
  'Hacker News': { label: 'Y', color: '#FF6600' },
  Lobsters: { label: 'L', color: '#A6291F' },
};

const SourceBadge = ({
  source,
  className,
}: {
  source: string;
  className: string;
}): ReactElement | null => {
  const badge = SOURCE_BADGE[source];
  if (!badge) {
    return null;
  }
  return (
    <span
      className={classNames(
        'grid shrink-0 place-items-center font-bold',
        badge.color ? 'text-white' : 'bg-text-primary text-background-default',
        className,
      )}
      style={badge.color ? { backgroundColor: badge.color } : undefined}
    >
      {badge.label}
    </span>
  );
};

const LEAN_CHIP: Record<SourceLean, { label: string; className: string }> = {
  positive: {
    label: 'Positive',
    className: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  mixed: {
    label: 'Mixed',
    className: 'bg-accent-bun-flat text-accent-bun-default',
  },
  skeptical: {
    label: 'Skeptical',
    className: 'bg-accent-water-flat text-accent-water-default',
  },
  heated: {
    label: 'Heated',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
};

const BlockTitle = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const ArgumentList = ({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'pro' | 'con';
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2">
    <Typography
      type={TypographyType.Footnote}
      color={
        tone === 'pro'
          ? TypographyColor.StatusSuccess
          : TypographyColor.StatusError
      }
      bold
    >
      {title}
    </Typography>
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            className={classNames(
              'mt-1.5 size-1.5 shrink-0 rounded-full',
              tone === 'pro'
                ? 'bg-accent-avocado-default'
                : 'bg-accent-ketchup-default',
            )}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="min-w-0 flex-1"
          >
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  </div>
);

const Flashpoint = ({ text }: { text: string }): ReactElement => (
  <div className="flex gap-2 rounded-10 bg-accent-bun-flat p-3">
    <span className="mt-0.5 shrink-0 text-accent-bun-default">
      <HotIcon size={IconSize.Size16} />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        bold
      >
        The big debate
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {text}
      </Typography>
    </div>
  </div>
);

const SourceRow = ({
  source,
  lean,
  note,
  url,
  discussion,
}: SourceSentiment & {
  discussion?: CommunitySentimentDiscussion;
}): ReactElement => {
  const chip = LEAN_CHIP[lean];

  const content = (
    <>
      <SourceBadge source={source} className="size-6 rounded-8 text-[11px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
          >
            {source}
          </Typography>
          <span
            className={classNames(
              'inline-flex items-center rounded-6 px-1.5 py-0.5 font-bold typo-caption2',
              chip.className,
            )}
          >
            {chip.label}
          </span>
          {discussion && (
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              className="ml-auto shrink-0"
            >
              {formatDiscussionCount(discussion.points)} points ·{' '}
              {formatDiscussionCount(discussion.commentsCount)} comments
            </Typography>
          )}
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {note}
        </Typography>
      </div>
      {/* Always reserve the link slot so rows without a link stay aligned. */}
      <span
        className={classNames(
          'mt-0.5 shrink-0 text-text-tertiary transition-colors group-hover:text-brand-default',
          !url && 'invisible',
        )}
      >
        <OpenLinkIcon size={IconSize.Size16} />
      </span>
    </>
  );

  const rowClassName = '-mx-2 flex gap-2.5 rounded-10 px-2 py-1.5';

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel={anchorDefaultRel}
        title={`View the discussion on ${source}`}
        className={classNames(
          rowClassName,
          'group transition-colors hover:bg-surface-hover',
        )}
      >
        {content}
      </a>
    );
  }

  return <div className={rowClassName}>{content}</div>;
};

const HighlightCard = ({
  quote,
  author,
  source,
  url,
  metrics,
}: SentimentHighlight): ReactElement => (
  <a
    href={url}
    target="_blank"
    rel={anchorDefaultRel}
    title={`Read on ${source}`}
    className="group flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary"
  >
    <Typography type={TypographyType.Footnote} color={TypographyColor.Primary}>
      &ldquo;{quote}&rdquo;
    </Typography>
    <div className="flex items-center gap-1.5">
      <SourceBadge source={source} className="size-5 rounded-6 text-[10px]" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Secondary}
          bold
          className="shrink-0"
        >
          {author}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="min-w-0 flex-1 truncate"
        >
          · {metrics.join(' · ')}
        </Typography>
      </div>
      <span className="shrink-0 text-text-tertiary transition-colors group-hover:text-brand-default">
        <OpenLinkIcon size={IconSize.Size16} />
      </span>
    </div>
  </a>
);

/**
 * Community Sentiment — Layer 2. A modular set of blocks revealed by "Deep dive".
 * Each block only renders when it has content, so the layer composes itself to
 * the item's sentiment shape (a calm, consensus item shows fewer blocks than a
 * divisive one).
 */
const INITIAL_HIGHLIGHTS = 3;

export const CommunitySentimentBreakdown = ({
  data,
}: {
  data: CommunitySentimentData;
}): ReactElement => {
  const {
    pros,
    cons,
    bySource,
    hottestDebate,
    openQuestions,
    highlights,
    discussions,
  } = data;
  const [showAllHighlights, setShowAllHighlights] = useState(false);

  const visibleHighlights = showAllHighlights
    ? highlights
    : highlights.slice(0, INITIAL_HIGHLIGHTS);
  const hasMoreHighlights =
    !showAllHighlights && highlights.length > INITIAL_HIGHLIGHTS;

  const discussionByProvider = new Map(
    discussions?.map((discussion) => [discussion.provider, discussion]),
  );

  return (
    <div className="flex animate-composer-in flex-col gap-4 border-t border-border-subtlest-tertiary pt-3">
      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid gap-x-4 gap-y-3 tablet:grid-cols-2">
          {pros.length > 0 && (
            <ArgumentList title="What devs like" items={pros} tone="pro" />
          )}
          {cons.length > 0 && (
            <ArgumentList title="What worries them" items={cons} tone="con" />
          )}
        </div>
      )}

      {hottestDebate && <Flashpoint text={hottestDebate} />}

      {openQuestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <BlockTitle>Open questions</BlockTitle>
          <ul className="flex flex-col gap-1.5">
            {openQuestions.map((question) => (
              <li key={question} className="flex gap-2">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Brand}
                  bold
                  className="shrink-0"
                >
                  ?
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                  className="min-w-0 flex-1"
                >
                  {question}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bySource.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <BlockTitle>By community</BlockTitle>
          <div className="flex flex-col gap-1">
            {bySource.map((item) => (
              <SourceRow
                key={item.source}
                {...item}
                discussion={discussionByProvider.get(
                  SOURCE_TO_PROVIDER[item.source],
                )}
              />
            ))}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="flex flex-col gap-2">
          <BlockTitle>Top picks</BlockTitle>
          <div className="flex flex-col gap-2">
            {visibleHighlights.map((item) => (
              <HighlightCard key={item.url} {...item} />
            ))}
          </div>
          {hasMoreHighlights && (
            <button
              type="button"
              onClick={() => setShowAllHighlights(true)}
              className="mt-0.5 flex items-center gap-1 self-center font-bold text-text-tertiary transition-colors typo-footnote hover:text-text-primary"
            >
              Load more
              <ArrowIcon size={IconSize.Size16} className="rotate-180" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
