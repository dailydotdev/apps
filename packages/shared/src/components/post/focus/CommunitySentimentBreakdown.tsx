import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { OpenLinkIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { anchorDefaultRel, capitalize } from '../../../lib/strings';
import { largeNumberFormat } from '../../../lib/numberFormat';
import type {
  CommunitySentimentData,
  CommunitySentimentDiscussion,
  SourceLean,
  SourceSentiment,
} from './CommunitySentiment';

// The take payload references communities loosely — the LLM may emit a
// provider id ("hackernews") or a friendly name ("Hacker News"). Normalize
// everything to the discussion payload's provider id so display labels,
// badges and raw counts all resolve from the same key.
const PROVIDER_ALIASES: Record<string, string> = {
  hn: 'hackernews',
  twitter: 'x',
};

const normalizeProvider = (source: string): string => {
  const key = source.toLowerCase().replace(/[^a-z0-9]/g, '');
  return PROVIDER_ALIASES[key] ?? key;
};

// Authentic-enough source marks: HN's real logo is an orange "Y" square, X the
// glyph, Lobsters a red square. `color` omitted => theme-adaptive mono badge.
const PROVIDER_META: Record<
  string,
  { label: string; badge: { glyph: string; color?: string } }
> = {
  hackernews: { label: 'Hacker News', badge: { glyph: 'Y', color: '#FF6600' } },
  lobsters: { label: 'Lobsters', badge: { glyph: 'L', color: '#A6291F' } },
  x: { label: 'X', badge: { glyph: '𝕏' } },
};

const providerLabel = (source: string): string =>
  PROVIDER_META[normalizeProvider(source)]?.label ?? capitalize(source);

const formatDiscussionCount = (value: number): string =>
  largeNumberFormat(value)?.toLowerCase() ?? `${value}`;

const SourceBadge = ({
  source,
  className,
}: {
  source: string;
  className: string;
}): ReactElement | null => {
  const badge = PROVIDER_META[normalizeProvider(source)]?.badge;
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
      {badge.glyph}
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
  const label = providerLabel(source);
  // The narrative row may not carry its own url; the raw discussion entry for
  // the same provider is the same thread, so use it as the link fallback.
  const linkUrl = url ?? discussion?.url;

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
            {label}
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
          !linkUrl && 'invisible',
        )}
      >
        <OpenLinkIcon size={IconSize.Size16} />
      </span>
    </>
  );

  const rowClassName = '-mx-2 flex gap-2.5 rounded-10 px-2 py-1.5';

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel={anchorDefaultRel}
        title={`View the discussion on ${label}`}
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

/**
 * Community Sentiment — Layer 2. A modular set of blocks revealed by "Deep dive".
 * Each block only renders when it has content, so the layer composes itself to
 * the item's sentiment shape (a calm, consensus item shows fewer blocks than a
 * divisive one).
 */
export const CommunitySentimentBreakdown = ({
  data,
}: {
  data: CommunitySentimentData;
}): ReactElement => {
  const { pros, cons, bySource, discussions } = data;

  const discussionByProvider = new Map(
    discussions?.map((discussion) => [
      normalizeProvider(discussion.provider),
      discussion,
    ]),
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

      {bySource.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <BlockTitle>By community</BlockTitle>
          <div className="flex flex-col gap-1">
            {bySource.map((item) => (
              <SourceRow
                key={item.source}
                {...item}
                discussion={discussionByProvider.get(
                  normalizeProvider(item.source),
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
