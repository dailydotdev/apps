import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  TrendingIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { StatPill } from './StatPill';
import type { StoryItem } from './types';

interface CoverGridProps {
  stories: StoryItem[];
  readSet: Set<string>;
  onOpen: (story: StoryItem) => void;
  onMarkRead: (id: string) => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const StoryRow = ({
  story,
  isRead,
  isExpanded,
  onToggle,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}): ReactElement => {
  const sourcesShown = story.sources.slice(0, 3);
  const extraSources = story.sources.length - sourcesShown.length;
  const sourceNames = sourcesShown.map((s) => s.sourceName).join(', ');
  const summary = stripMd(story.summary).trim();
  const panelId = `brief-tldr-${story.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-float',
          isRead && !isExpanded && 'opacity-60',
        )}
      >
        <div className="flex w-full min-w-0 flex-col gap-2">
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Body}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              '!leading-snug',
              isRead &&
                !isExpanded &&
                'decoration-text-quaternary/40 line-through',
            )}
          >
            {story.title}
          </Typography>

          {isExpanded ? (
            <div id={panelId}>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="!leading-relaxed"
              >
                {summary}
              </Typography>
            </div>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <StatPill
              ariaLabel={`${story.totalUpvotes} upvotes`}
              onClick={onOpen}
              icon={
                <UpvoteIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={story.totalUpvotes}
            />
            <StatPill
              ariaLabel={`${story.totalComments} comments`}
              onClick={onOpen}
              icon={
                <DiscussIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={story.totalComments}
            />
            <span className="inline-flex min-w-0 items-center gap-2 pl-1">
              <span className="inline-flex shrink-0 items-center -space-x-1.5">
                {sourcesShown.map((src) => (
                  <span
                    key={src.sourceId}
                    className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float"
                  >
                    <img
                      src={src.sourceImage}
                      alt=""
                      loading="lazy"
                      className="size-4 object-cover"
                    />
                  </span>
                ))}
              </span>
              <span className="hidden min-w-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 tablet:inline-flex">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  {sourceNames}
                  {extraSources > 0 ? ` +${extraSources}` : ''}
                </Typography>
              </span>
            </span>
          </div>
          {isExpanded ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  onOpen();
                }
              }}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert transition-colors hover:bg-brand-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-subtlest-primary"
            >
              <Typography type={TypographyType.Footnote} bold>
                Read full breakdown
              </Typography>
              <ArrowIcon size={IconSize.XXSmall} className="rotate-90" />
            </span>
          ) : null}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'shrink-0 transition-all duration-300 ease-out',
              isExpanded
                ? 'rotate-0 text-text-tertiary'
                : 'rotate-180 text-text-quaternary opacity-0 group-hover:opacity-100',
            )}
            aria-hidden
          />
        </div>
      </button>
    </li>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
  onMarkRead,
}: CoverGridProps): ReactElement => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2 px-1">
        <TrendingIcon
          size={IconSize.Small}
          className="self-center text-accent-cabbage-default"
          secondary
        />
        <Typography type={TypographyType.Title3} bold>
          Trending discussions
        </Typography>
      </div>
      <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
        {stories.map((s) => (
          <StoryRow
            key={s.id}
            story={s}
            isRead={readSet.has(s.id)}
            isExpanded={expanded === s.id}
            onToggle={() => {
              const isOpen = expanded === s.id;
              setExpanded(isOpen ? null : s.id);
              if (!isOpen) {
                onMarkRead(s.id);
              }
            }}
            onOpen={() => onOpen(s)}
          />
        ))}
      </ol>
    </section>
  );
};
