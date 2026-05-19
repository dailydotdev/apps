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
  const words =
    story.summary.split(/\s+/).filter(Boolean).length +
    story.highlightedComments
      .slice(0, 3)
      .reduce(
        (acc, c) => acc + c.content.split(/\s+/).filter(Boolean).length,
        0,
      );
  return Math.max(2, Math.round(words / 220));
};

export const CoverLead = ({ story, onOpen }: CoverLeadProps): ReactElement => {
  const topComment = story.highlightedComments[0];
  const quote = useMemo(() => {
    if (!topComment) {
      return null;
    }
    const clean = stripMd(topComment.content).trim();
    return clean.length > 240 ? `${clean.slice(0, 237)}…` : clean;
  }, [topComment]);

  const deck = useMemo(() => {
    const clean = stripMd(story.summary).trim();
    return clean.length > 320 ? `${clean.slice(0, 317)}…` : clean;
  }, [story.summary]);

  const minutes = estimateMinutes(story);
  const contributorCount =
    story.sources.length + story.highlightedComments.length;
  const sourcesShown = story.sources.slice(0, 4);
  const sourceLine = sourcesShown.map((s) => s.sourceName).join(' · ');
  const extraSources = story.sources.length - sourcesShown.length;

  return (
    <article className="mt-2 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
      <div className="from-brand-float/60 flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary bg-gradient-to-r via-background-subtle to-background-subtle px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="bg-accent-ketchup-default/15 inline-grid size-6 place-items-center rounded-full text-accent-ketchup-default">
            <HotIcon size={IconSize.XSmall} secondary />
          </span>
          <Typography
            type={TypographyType.Caption2}
            bold
            className="uppercase tracking-[0.18em] text-accent-ketchup-default"
          >
            {briefCopy.leadEyebrow}
          </Typography>
        </div>
        <span className="inline-flex items-center gap-1 text-text-tertiary">
          <TimerIcon size={IconSize.XSmall} />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
          >
            {briefCopy.storyReadTime(minutes)}
          </Typography>
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 tablet:p-7">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="!leading-[1.1] tracking-[-0.025em]"
        >
          {story.title}
        </Typography>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[42rem] !leading-relaxed"
        >
          {deck}
        </Typography>

        <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-4 tablet:flex-row tablet:items-center tablet:gap-6">
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
              <span className="text-text-quaternary">
                {briefCopy.storySourcesLabel}{' '}
              </span>
              {sourceLine}
              {extraSources > 0 ? ` · +${extraSources} more` : ''}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-text-quaternary tablet:ml-auto">
            <span className="inline-flex items-center gap-1">
              <UpvoteIcon
                size={IconSize.XXSmall}
                className="text-accent-avocado-default"
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
              >
                {story.totalUpvotes}
              </Typography>
            </span>
            <span className="inline-flex items-center gap-1">
              <DiscussIcon size={IconSize.XXSmall} />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
              >
                {story.totalComments}
              </Typography>
            </span>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              {briefCopy.storyContributors(contributorCount)}
            </Typography>
          </div>
        </div>

        {quote ? (
          <figure
            className={classNames(
              'border-brand-default/70 bg-brand-float/40 rounded-12 border-l-2 p-4',
            )}
          >
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="italic !leading-snug"
            >
              “{quote}”
            </Typography>
            <figcaption className="mt-2 flex items-center gap-2">
              <img
                src={topComment!.userImage}
                alt=""
                loading="lazy"
                className="size-5 rounded-full object-cover"
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
              >
                @{topComment!.username}
              </Typography>
              <span className="inline-flex items-center gap-0.5 text-text-quaternary">
                <UpvoteIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                >
                  {topComment!.upvotes}
                </Typography>
              </span>
            </figcaption>
          </figure>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={onOpen}
          >
            {briefCopy.openStory}
          </Button>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {briefCopy.storyPostCount(story.posts.length)} aggregated
          </Typography>
        </div>
      </div>
    </article>
  );
};
