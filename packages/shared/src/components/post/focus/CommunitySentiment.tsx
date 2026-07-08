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
  hottestDebate: string;
  /** Layer 2 — what the community is still asking. */
  openQuestions: string[];
}

/**
 * Layer 1 + 2 mock data. Replaced by a real aggregation query once the design
 * lands; kept as a typed default so wiring live data later is a one-line swap.
 */
export const SAMPLE_COMMUNITY_SENTIMENT: CommunitySentimentData = {
  breakdown: { positive: 57, mixed: 27, critical: 16 },
  tldr: `Developers love the idea of collapsing their stack onto Postgres to cut ops overhead and complexity, but a vocal group warns that Redis, Kafka, and Elasticsearch exist for a reason once you hit real scale.`,
  postCount: 410,
  sources: ['X', 'Hacker News', 'Lobsters'],
  pros: [
    'One database to run, back up and monitor — a real ops win for small teams',
    'Extensions like pgvector, pg_search, PGMQ and TimescaleDB are genuinely capable now',
    'Transactions and joins across data that used to live in separate systems',
  ],
  cons: [
    'Purpose-built tools still win at scale — Kafka throughput, ES relevance, Redis latency',
    'Overloading one primary turns it into a single point of failure and contention',
    'Extensions bring their own upgrade and operational pain',
  ],
  bySource: [
    {
      source: 'Hacker News',
      lean: 'heated',
      note: `Classic "just use Postgres" vs "know your scale" flame war`,
      url: 'https://news.ycombinator.com/item?id=39135501',
    },
    {
      source: 'X',
      lean: 'positive',
      note: 'Devs cheering the stack simplification and cost savings',
    },
    {
      source: 'Lobsters',
      lean: 'skeptical',
      note: `More measured — "it works until it doesn't; depends on scale"`,
      url: 'https://lobste.rs/s/vtfkqh',
    },
  ],
  hottestDebate: `Is consolidating onto Postgres a smart simplification, or just deferring the scaling pain you'll pay for later?`,
  openQuestions: [
    'At what scale does the single-Postgres approach actually break down?',
    'Does pgvector / pg_search hold up against dedicated Elasticsearch on large corpora?',
    'Is the migration cost worth the ops savings for an existing stack?',
  ],
};

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
  data?: CommunitySentimentData;
  onSeeBreakdown?: () => void;
  className?: string;
}

/**
 * Community Sentiment — a light, at-a-glance read on what the developer community
 * outside daily.dev thinks about a post. Layer 1 (surface) is a plain-English
 * TL;DR + a breakdown bar; "Deep dive" expands the modular Layer 2 blocks in place.
 */
export const CommunitySentiment = ({
  data = SAMPLE_COMMUNITY_SENTIMENT,
  onSeeBreakdown,
  className,
}: CommunitySentimentProps): ReactElement => {
  const { breakdown, tldr, postCount } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = () => {
    setIsExpanded((prev) => !prev);
    onSeeBreakdown?.();
  };

  return (
    <section
      aria-label="What the community thinks"
      className={classNames(
        'flex flex-col gap-3 rounded-12 bg-surface-float p-3',
        className,
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
        </span>
        <span className="ml-auto flex items-baseline gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            {postCount}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            discussions
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
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isExpanded}
            className="ml-auto flex items-center gap-1 text-brand-default typo-footnote font-bold"
          >
            {isExpanded ? 'Show less' : 'Deep dive'}
            <ArrowIcon
              size={IconSize.Size16}
              className={isExpanded ? 'rotate-0' : 'rotate-180'}
            />
          </button>
        </div>
      </div>

      {isExpanded && <CommunitySentimentBreakdown data={data} />}
    </section>
  );
};
