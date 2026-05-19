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
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon, UpvoteIcon, DiscussIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface CoverLeadProps {
  story: StoryItem;
  totals: {
    total: number;
    readMinutes: number;
    savedMinutes: number;
    readCount: number;
    isComplete: boolean;
  };
  onOpen: () => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const MetaCell = ({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: string | number;
  emphasised?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
      bold
      className="uppercase tracking-[0.14em]"
    >
      {label}
    </Typography>
    <Typography
      type={emphasised ? TypographyType.Title3 : TypographyType.Body}
      bold
      color={TypographyColor.Primary}
      className="!leading-none"
    >
      {value}
    </Typography>
  </div>
);

export const CoverLead = ({
  story,
  totals,
  onOpen,
}: CoverLeadProps): ReactElement => {
  const { streak } = useReadingStreak();
  const topComment = story.highlightedComments[0];
  const quote = useMemo(() => {
    if (!topComment) {
      return null;
    }
    const clean = stripMd(topComment.content).trim();
    return clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
  }, [topComment]);
  const heroImage = story.posts.find((p) => p.image)?.image;
  const progress = totals.total
    ? Math.round((totals.readCount / totals.total) * 100)
    : 0;

  return (
    <article className="grid grid-cols-1 gap-4 laptop:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <button
        type="button"
        onClick={onOpen}
        className="group relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-6 text-left transition-transform hover:-translate-y-[1px] laptop:min-h-[24rem]"
      >
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt=""
              loading="eager"
              className="-z-10 absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="-z-10 via-background-default/85 to-background-default/10 absolute inset-0 bg-gradient-to-t from-background-default" />
          </>
        ) : null}
        <Typography
          type={TypographyType.Caption2}
          bold
          color={TypographyColor.Brand}
          className="mb-2 uppercase tracking-[0.18em]"
        >
          {briefCopy.leadEyebrow}
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="max-w-[36rem] !leading-[1.05] tracking-[-0.025em]"
        >
          {story.title}
        </Typography>
        {quote ? (
          <figure className="border-brand-default/70 mt-4 flex max-w-[36rem] gap-3 border-l-2 pl-3">
            <img
              src={topComment!.userImage}
              alt=""
              loading="lazy"
              className="size-7 rounded-full object-cover"
            />
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="italic"
              >
                “{quote}”
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                @{topComment!.username} · ↑ {topComment!.upvotes}
              </Typography>
            </div>
          </figure>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-text-tertiary">
          <span className="inline-flex items-center gap-1">
            <UpvoteIcon
              size={IconSize.XXSmall}
              className="text-accent-avocado-default"
            />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {story.totalUpvotes}
            </Typography>
          </span>
          <span className="inline-flex items-center gap-1">
            <DiscussIcon size={IconSize.XXSmall} />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {story.totalComments}
            </Typography>
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {story.sources.length} sources
          </Typography>
        </div>
        <div className="mt-5 inline-flex">
          <span className="pointer-events-none inline-flex items-center gap-2 rounded-12 bg-text-primary px-4 py-2 text-surface-invert transition-transform group-hover:translate-x-[2px]">
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.openStory}
            </Typography>
            <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
          </span>
        </div>
      </button>

      <aside className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <MetaCell
            label={briefCopy.storiesLabel}
            value={totals.total}
            emphasised
          />
          <MetaCell
            label={briefCopy.minutesLabel}
            value={`${totals.readMinutes} min`}
            emphasised
          />
          <MetaCell
            label={briefCopy.savedLabel}
            value={`~${totals.savedMinutes} min`}
          />
          <MetaCell
            label="Streak"
            value={streak?.current ? `${streak.current}d` : '—'}
          />
        </div>
        <div>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            bold
            className="mb-2 uppercase tracking-[0.14em]"
          >
            {briefCopy.progressLabel}
          </Typography>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-surface-float"
            role="progressbar"
            aria-label={briefCopy.progressLabel}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={classNames(
                'block h-full rounded-full transition-all duration-500',
                totals.isComplete
                  ? 'bg-accent-avocado-default'
                  : 'bg-brand-default',
              )}
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="mt-2"
          >
            {totals.readCount} of {totals.total} read
          </Typography>
        </div>
        <Button
          tag="a"
          href="#brief-end"
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          className="mt-auto justify-start"
          icon={<ArrowIcon className="rotate-180" />}
        >
          {briefCopy.controlSkip}
        </Button>
      </aside>
    </article>
  );
};
