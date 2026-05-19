import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { UpvoteIcon, DiscussIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface CoverGridProps {
  stories: StoryItem[];
  readSet: Set<string>;
  onOpen: (story: StoryItem) => void;
}

const SourceStack = ({ story }: { story: StoryItem }): ReactElement => {
  const shown = story.sources.slice(0, 3);
  const remaining = story.sources.length - shown.length;
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {shown.map((src, idx) => (
        <span
          key={src.sourceId}
          className={classNames(
            'overflow-hidden rounded-6 border border-background-default bg-surface-float',
            'size-5',
            idx === 0 ? '' : '-ml-1.5',
          )}
        >
          <img
            src={src.sourceImage}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        </span>
      ))}
      {remaining > 0 ? (
        <span className="ml-1 inline-block">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            +{remaining}
          </Typography>
        </span>
      ) : null}
    </span>
  );
};

const CoverGridCard = ({
  story,
  isRead,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const quote = story.highlightedComments[0];
  const cleanQuote = quote?.content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1')
    .trim();
  const shortQuote =
    cleanQuote && cleanQuote.length > 110
      ? `${cleanQuote.slice(0, 107)}…`
      : cleanQuote;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={classNames(
        'group flex h-full flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 text-left transition-colors hover:border-border-subtlest-secondary hover:bg-surface-float',
        isRead && 'opacity-60',
      )}
    >
      <SourceStack story={story} />
      <Typography
        type={TypographyType.Body}
        bold
        color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
        className={classNames(
          'line-clamp-3 !leading-snug transition-colors',
          isRead && 'decoration-text-quaternary/40 line-through',
          !isRead && 'group-hover:text-brand-default',
        )}
      >
        {story.title}
      </Typography>
      {shortQuote ? (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mt-auto line-clamp-2 italic"
        >
          “{shortQuote}”
        </Typography>
      ) : null}
      <div className="mt-auto flex items-center gap-3 pt-2 text-text-quaternary">
        <span className="inline-flex items-center gap-1">
          <UpvoteIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {story.totalUpvotes}
          </Typography>
        </span>
        <span className="inline-flex items-center gap-1">
          <DiscussIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {story.totalComments}
          </Typography>
        </span>
      </div>
    </button>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
}: CoverGridProps): ReactElement => (
  <section className="mt-8">
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
      bold
      className="mb-3 uppercase tracking-[0.18em]"
    >
      {briefCopy.attentionEyebrow}
    </Typography>
    <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
      {stories.map((s) => (
        <CoverGridCard
          key={s.id}
          story={s}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
        />
      ))}
    </div>
  </section>
);
