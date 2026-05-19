import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  ArrowIcon,
  HotIcon,
  TimerIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
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
    return clean.length > 240 ? `${clean.slice(0, 237)}…` : clean;
  }, [story.summary]);

  const minutes = estimateMinutes(story);
  const sourcesShown = story.sources.slice(0, 4);
  const sourceLine = sourcesShown.map((s) => s.sourceName).join(', ');
  const extraSources = story.sources.length - sourcesShown.length;

  return (
    <article className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-5 tablet:p-6">
      <div className="flex items-center gap-2 text-text-quaternary">
        <HotIcon
          size={IconSize.XSmall}
          className="text-accent-ketchup-default"
          secondary
        />
        <Typography
          type={TypographyType.Caption2}
          bold
          className="uppercase tracking-[0.16em] text-accent-ketchup-default"
        >
          {briefCopy.leadEyebrow}
        </Typography>
        <span className="text-border-subtlest-secondary">·</span>
        <span className="inline-flex items-center gap-1">
          <TimerIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            bold
          >
            {briefCopy.storyReadTime(minutes)}
          </Typography>
        </span>
        <span className="ml-auto inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <UpvoteIcon
              size={IconSize.XXSmall}
              className="text-accent-avocado-default"
            />
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              bold
            >
              {story.totalUpvotes}
            </Typography>
          </span>
          <span className="inline-flex items-center gap-1">
            <DiscussIcon size={IconSize.XXSmall} />
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              bold
            >
              {story.totalComments}
            </Typography>
          </span>
        </span>
      </div>

      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        bold
        className="!leading-[1.15] tracking-[-0.02em]"
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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0 items-center -space-x-1.5">
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
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 truncate"
          >
            {sourceLine}
            {extraSources > 0 ? ` +${extraSources}` : ''}
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
          onClick={onOpen}
        >
          {briefCopy.openStory}
        </Button>
      </div>
    </article>
  );
};
