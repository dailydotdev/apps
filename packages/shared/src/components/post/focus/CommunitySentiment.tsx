import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { DiscussIcon, ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { RelativeTime } from '../../utilities/RelativeTime';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { CommunitySentimentBreakdown } from './CommunitySentimentBreakdown';

export interface SentimentBreakdown {
  /** Share of the community that is positive (0-100). */
  positive: number;
  /** Share that is mixed/neutral (0-100). */
  mixed: number;
  /** Share that is critical/skeptical (0-100). */
  critical: number;
}

export type SourceLean = 'positive' | 'mixed' | 'skeptical' | 'heated';

export interface SourceSentiment {
  /** External community name, e.g. "Hacker News". */
  source: string;
  /** How that community leans overall. */
  lean: SourceLean;
  /** One-line characterization of the conversation there. */
  note: string;
  /** Link to the actual discussion, when it lives in one place (HN/Lobsters). */
  url?: string;
}

export interface SentimentHighlight {
  /** Verbatim, punchy quote worth reading. */
  quote: string;
  /** Author handle or username. */
  author: string;
  /** Where it was said. */
  source: string;
  /** Link to the original post/comment. */
  url: string;
  /** Engagement metrics for the platform, e.g. ["2.4k likes", "180 replies"]. */
  metrics: string[];
}

/** A discussion thread the take is aggregated from — raw per-platform counts,
 * separate from the `bySource` narrative lean. */
export interface CommunitySentimentDiscussion {
  /** Machine-friendly platform id, e.g. "hackernews" | "lobsters". */
  provider: string;
  /** Link to the discussion thread. */
  url: string;
  /** Upvotes/points on that platform. */
  points: number;
  /** Comment count on that platform. */
  commentsCount: number;
}

export interface CommunitySentimentData {
  /** How opinion splits across positive / mixed / skeptical — the surface metric. */
  breakdown: SentimentBreakdown;
  /** One-to-two sentence plain-English summary of what the community thinks. */
  tldr: string;
  /** Total discussions the take is aggregated from. */
  postCount: number;
  /** External communities the take is drawn from. */
  sources: string[];
  /** Layer 2 — the case for (coalition). */
  pros: string[];
  /** Layer 2 — the pushback (opposition). */
  cons: string[];
  /** Layer 2 — how each external community leans. */
  bySource: SourceSentiment[];
  /** Layer 2 — the single biggest flashpoint, if the take is divisive. */
  hottestDebate?: string;
  /** Layer 2 — what the community is still asking. */
  openQuestions: string[];
  /** Layer 3 — a few verbatim receipts worth reading. */
  highlights: SentimentHighlight[];
  /** Raw per-platform discussion links/counts backing the take. */
  discussions?: CommunitySentimentDiscussion[];
  /** When the take was last (re)generated — distinct from the post's own
   * `updatedAt`, which reflects the whole post row. */
  updatedAt?: string;
}

/** Structured engagement counts for a highlight, exactly as the API returns
 * them — apps formats these into the display strings `SentimentHighlight`
 * expects (e.g. `{ points: 214 }` => "214 points"). */
export interface SentimentHighlightMetrics {
  /** Upvotes/points on the source platform (HN, Lobsters). */
  points?: number;
  /** Reply/comment count. */
  replies?: number;
  /** Likes/favorites — X-only; unused for HN/Lobsters in v1. */
  likes?: number;
}

/** Raw highlight shape returned by the API: same as `SentimentHighlight` but
 * with structured (not yet formatted) metrics. */
export type CommunitySentimentHighlightPost = Omit<
  SentimentHighlight,
  'metrics'
> & {
  /** Nullable on the wire — the API omits metrics when the source had none. */
  metrics?: SentimentHighlightMetrics | null;
};

/**
 * Wire shape of `Post.communitySentiment`: the same contract as
 * `CommunitySentimentData`, but highlight metrics arrive structured rather
 * than as formatted display strings. `mapCommunitySentimentPost` below
 * converts one into the other — the only real work in wiring up real data.
 */
export type CommunitySentimentPost = Omit<
  CommunitySentimentData,
  'highlights'
> & {
  highlights: CommunitySentimentHighlightPost[];
};

const HIGHLIGHT_METRIC_LABELS: Array<{
  key: keyof SentimentHighlightMetrics;
  label: string;
}> = [
  { key: 'points', label: 'points' },
  { key: 'replies', label: 'comments' },
  { key: 'likes', label: 'likes' },
];

/** `largeNumberFormat` formats "2.4K"; the design uses a lowercase "k". */
const formatMetricCount = (value: number): string =>
  largeNumberFormat(value)?.toLowerCase() ?? `${value}`;

const formatHighlightMetrics = (metrics: SentimentHighlightMetrics): string[] =>
  HIGHLIGHT_METRIC_LABELS.reduce<string[]>((acc, { key, label }) => {
    const value = metrics[key];
    if (typeof value === 'number') {
      acc.push(`${formatMetricCount(value)} ${label}`);
    }
    return acc;
  }, []);

/**
 * Maps the API's wire shape (structured highlight metrics) to the display
 * shape the components in this file render.
 */
export const mapCommunitySentimentPost = (
  data: CommunitySentimentPost,
): CommunitySentimentData => ({
  ...data,
  highlights: data.highlights.map((highlight) => ({
    ...highlight,
    metrics: highlight.metrics ? formatHighlightMetrics(highlight.metrics) : [],
  })),
});

const BREAKDOWN_SEGMENTS: Array<{
  key: keyof SentimentBreakdown;
  label: string;
  color: string;
}> = [
  { key: 'positive', label: 'positive', color: 'bg-accent-avocado-default' },
  { key: 'mixed', label: 'mixed', color: 'bg-accent-bun-default' },
  { key: 'critical', label: 'skeptical', color: 'bg-accent-ketchup-default' },
];

interface CommunitySentimentProps {
  /** `null`/`undefined` render nothing — a post without a take has no widget. */
  data?: CommunitySentimentData | null;
  onSeeBreakdown?: () => void;
  className?: string;
}

/**
 * Community Sentiment — a light, at-a-glance read on what the developer community
 * outside daily.dev thinks about a post. Layer 1 (surface) is a plain-English
 * TL;DR + a breakdown bar; "Deep dive" expands the modular Layer 2 blocks in place.
 */
export const CommunitySentiment = ({
  data,
  onSeeBreakdown,
  className,
}: CommunitySentimentProps): ReactElement | null => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) {
    return null;
  }

  const { breakdown, tldr, postCount, discussions, updatedAt } = data;

  // `postCount` is the number of source threads (e.g. one HN + one Lobsters
  // thread = 2), which undersells the analysis — the take is distilled from
  // every comment in those threads, so lead with the comment total instead.
  const totalComments =
    discussions?.reduce(
      (total, discussion) => total + discussion.commentsCount,
      0,
    ) ?? 0;
  const stat =
    totalComments > 0
      ? { value: totalComments, label: 'comments' }
      : { value: postCount, label: 'discussions' };

  const toggle = () => {
    setIsExpanded((prev) => !prev);
    onSeeBreakdown?.();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <section
      aria-label="What the community thinks"
      className={classNames(
        'flex flex-col rounded-12 bg-surface-float',
        className,
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={classNames(
          'flex cursor-pointer flex-col gap-3 rounded-12 p-3 text-left transition-colors hover:bg-surface-hover',
          isExpanded && 'rounded-b-none',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-text-tertiary">
            <DiscussIcon size={IconSize.Size16} />
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
            >
              Community take
            </Typography>
            {updatedAt && (
              <>
                <span aria-hidden>·</span>
                <Typography type={TypographyType.Caption1}>
                  Updated <RelativeTime dateTime={updatedAt} />
                </Typography>
              </>
            )}
          </span>
          <span className="ml-auto flex items-baseline gap-1">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              {formatMetricCount(stat.value)}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {stat.label}
            </Typography>
          </span>
        </div>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          className="select-text"
        >
          {tldr}
        </Typography>

        <div className="flex flex-col gap-2">
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-6">
            {BREAKDOWN_SEGMENTS.map(({ key, color }) => (
              <span
                key={key}
                className={color}
                style={{ width: `${breakdown[key]}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {BREAKDOWN_SEGMENTS.map(({ key, label, color }) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={classNames('size-2 rounded-4', color)} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                >
                  {breakdown[key]}% {label}
                </Typography>
              </span>
            ))}
            <span className="ml-auto flex items-center gap-1 font-bold text-brand-default typo-footnote">
              {isExpanded ? 'Show less' : 'Deep dive'}
              <ArrowIcon
                size={IconSize.Size16}
                className={isExpanded ? 'rotate-0' : 'rotate-180'}
              />
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3">
          <CommunitySentimentBreakdown data={data} />
        </div>
      )}
    </section>
  );
};
