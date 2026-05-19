import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  TrendingIcon,
  TimerIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface CoverGridProps {
  stories: StoryItem[];
  readSet: Set<string>;
  onOpen: (story: StoryItem) => void;
}

const estimateMinutes = (story: StoryItem): number =>
  Math.max(
    2,
    Math.round(story.summary.split(/\s+/).filter(Boolean).length / 220),
  );

const formatRank = (n: number): string => String(n + 1).padStart(2, '0');

const StoryRow = ({
  story,
  rank,
  isRead,
  onOpen,
  isLast,
}: {
  story: StoryItem;
  rank: number;
  isRead: boolean;
  onOpen: () => void;
  isLast: boolean;
}): ReactElement => {
  const minutes = estimateMinutes(story);
  const primarySource = story.sources[0];
  const extraSources = story.sources.length - 1;

  return (
    <li
      className={classNames(
        'border-border-subtlest-tertiary',
        !isLast && 'border-b',
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-float',
          isRead && 'opacity-60',
        )}
      >
        <span
          aria-hidden
          className="hidden w-7 shrink-0 tabular-nums tablet:block"
        >
          <Typography
            type={TypographyType.Footnote}
            color={
              isRead ? TypographyColor.Quaternary : TypographyColor.Tertiary
            }
            bold
          >
            {formatRank(rank)}
          </Typography>
        </span>
        <div className="min-w-0 flex-1">
          <Typography
            type={TypographyType.Body}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              '!leading-snug transition-colors',
              isRead && 'decoration-text-quaternary/40 line-through',
              !isRead && 'group-hover:text-brand-default',
            )}
          >
            {story.title}
          </Typography>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-text-quaternary">
            {primarySource ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <span className="size-3.5 shrink-0 overflow-hidden rounded-4 bg-surface-float">
                  <img
                    src={primarySource.sourceImage}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  {primarySource.sourceName}
                  {extraSources > 0 ? ` +${extraSources}` : ''}
                </Typography>
              </span>
            ) : null}
            <span className="text-border-subtlest-secondary">·</span>
            <span className="inline-flex items-center gap-1">
              <TimerIcon size={IconSize.XXSmall} />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                {briefCopy.storyReadTime(minutes)}
              </Typography>
            </span>
            <span className="ml-auto inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <UpvoteIcon
                  size={IconSize.XXSmall}
                  className="text-accent-avocado-default"
                />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {story.totalUpvotes}
                </Typography>
              </span>
              <span className="inline-flex items-center gap-0.5">
                <DiscussIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {story.totalComments}
                </Typography>
              </span>
            </span>
          </div>
        </div>
        <ArrowIcon
          size={IconSize.XSmall}
          className="hidden shrink-0 rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100 tablet:block"
        />
      </button>
    </li>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
}: CoverGridProps): ReactElement => (
  <section>
    <div className="mb-2 flex items-center gap-2 px-1">
      <TrendingIcon
        size={IconSize.XSmall}
        className="text-accent-cabbage-default"
        secondary
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Primary}
        bold
        className="uppercase tracking-[0.16em]"
      >
        {briefCopy.attentionEyebrow}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="tabular-nums"
      >
        · {stories.length}
      </Typography>
    </div>
    <ol className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle">
      {stories.map((s, idx) => (
        <StoryRow
          key={s.id}
          story={s}
          rank={idx}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
          isLast={idx === stories.length - 1}
        />
      ))}
    </ol>
  </section>
);
