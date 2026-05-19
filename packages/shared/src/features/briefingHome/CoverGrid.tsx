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

const StoryRow = ({
  story,
  isRead,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const minutes = estimateMinutes(story);
  const primarySource = story.sources[0];
  const extraSources = story.sources.length - 1;
  const thumb = story.posts.find((p) => p.image)?.image;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'group flex h-full w-full flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle text-left transition-colors hover:border-border-subtlest-secondary',
          isRead && 'opacity-60',
        )}
      >
        <div className="relative aspect-[16/9] w-full shrink-0 bg-surface-float">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
          <Typography
            type={TypographyType.Body}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              'line-clamp-2 !leading-snug transition-colors',
              isRead && 'decoration-text-quaternary/40 line-through',
              !isRead && 'group-hover:text-brand-default',
            )}
          >
            {story.title}
          </Typography>
          <div className="mt-auto flex flex-wrap items-center gap-2 text-text-quaternary">
            {primarySource ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="size-4 shrink-0 overflow-hidden rounded-4 bg-surface-float">
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
            <span className="ml-auto inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <TimerIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {minutes}m
                </Typography>
              </span>
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
    <ol className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
      {stories.map((s) => (
        <StoryRow
          key={s.id}
          story={s}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
        />
      ))}
    </ol>
  </section>
);
