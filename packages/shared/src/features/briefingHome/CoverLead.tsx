import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  ArrowIcon,
  TimerIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { StatPill } from './StatPill';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface CoverLeadProps {
  story: StoryItem;
  onOpen: () => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const estimateMinutes = (story: StoryItem): number => {
  const words = story.summary.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
};

export const CoverLead = ({ story, onOpen }: CoverLeadProps): ReactElement => {
  const deck = useMemo(() => {
    const clean = stripMd(story.summary).trim();
    return clean.length > 180 ? `${clean.slice(0, 177)}…` : clean;
  }, [story.summary]);

  const minutes = estimateMinutes(story);
  const sourcesShown = story.sources.slice(0, 4);
  const heroImage = story.posts.find((p) => p.image)?.image;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-subtle text-left transition-colors hover:border-border-subtlest-tertiary tablet:flex-row"
    >
      <div
        className={classNames(
          'relative shrink-0 bg-surface-float tablet:w-[44%]',
          'aspect-[16/10] tablet:aspect-auto',
        )}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-ketchup-bolder to-accent-bun-bolder" />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-8 bg-accent-ketchup-default px-2 py-1 shadow-2">
          <span className="size-1.5 rounded-full bg-white" />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            bold
            className="uppercase tracking-[0.18em] text-white"
          >
            {briefCopy.leadEyebrow}
          </Typography>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 tablet:p-6">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="!leading-[1.15] tracking-[-0.02em] transition-colors group-hover:text-brand-default"
        >
          {story.title}
        </Typography>

        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="!leading-relaxed"
        >
          {deck}
        </Typography>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex shrink-0 items-center -space-x-1.5 pr-1">
              {sourcesShown.map((src) => (
                <span
                  key={src.sourceId}
                  className="overflow-hidden rounded-full border-2 border-background-subtle bg-surface-float"
                >
                  <img
                    src={src.sourceImage}
                    alt=""
                    loading="lazy"
                    className="size-5 object-cover"
                  />
                </span>
              ))}
            </span>
            <StatPill
              ariaLabel={`${minutes} minutes read`}
              icon={
                <TimerIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={briefCopy.storyReadTime(minutes)}
            />
            <StatPill
              ariaLabel={`${story.totalUpvotes} upvotes`}
              icon={
                <UpvoteIcon
                  size={IconSize.XSmall}
                  className="text-accent-avocado-default"
                />
              }
              value={story.totalUpvotes}
            />
            <StatPill
              ariaLabel={`${story.totalComments} comments`}
              icon={
                <DiscussIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={story.totalComments}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert transition-colors group-hover:bg-brand-default">
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.openStory}
            </Typography>
            <ArrowIcon size={IconSize.XXSmall} className="rotate-90" />
          </span>
        </div>
      </div>
    </button>
  );
};
