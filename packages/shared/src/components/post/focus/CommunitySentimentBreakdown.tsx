import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { HotIcon, OpenLinkIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { anchorDefaultRel } from '../../../lib/strings';
import type {
  CommunitySentimentData,
  SourceLean,
  SourceSentiment,
} from './CommunitySentiment';

// Authentic-enough source marks: HN's real logo is an orange "Y" square, X the
// glyph, Lobsters a red square. `color` omitted => theme-adaptive mono badge.
const SOURCE_BADGE: Record<string, { label: string; color?: string }> = {
  X: { label: '𝕏' },
  'Hacker News': { label: 'Y', color: '#FF6600' },
  Lobsters: { label: 'L', color: '#A6291F' },
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
    <div className="flex flex-col gap-0.5">
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
}: SourceSentiment): ReactElement => {
  const chip = LEAN_CHIP[lean];
  const badge = SOURCE_BADGE[source];

  const content = (
    <>
      {badge && (
        <span
          className={classNames(
            'grid size-6 shrink-0 place-items-center rounded-8 text-[11px] font-bold',
            badge.color ? 'text-white' : 'bg-text-primary text-background-default',
          )}
          style={badge.color ? { backgroundColor: badge.color } : undefined}
        >
          {badge.label}
        </span>
      )}
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
              'inline-flex items-center rounded-6 px-1.5 py-0.5 typo-caption2 font-bold',
              chip.className,
            )}
          >
            {chip.label}
          </span>
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {note}
        </Typography>
      </div>
      {url && (
        <span className="mt-0.5 shrink-0 text-text-tertiary transition-colors group-hover:text-brand-default">
          <OpenLinkIcon size={IconSize.Size16} />
        </span>
      )}
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
  const { pros, cons, bySource, hottestDebate, openQuestions } = data;

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
              <SourceRow key={item.source} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
