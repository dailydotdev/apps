import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ChatterComment, ChatterSource } from '../types';
import { platformVisuals } from '../platforms';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  AiIcon,
  ArrowIcon,
  OpenLinkIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useToggle } from '../../../hooks/useToggle';
import { largeNumberFormat } from '../../../lib/numberFormat';

const Avatar = ({
  background,
  initial,
}: {
  background: string;
  initial: string;
}): ReactElement => (
  <span
    className="flex size-8 shrink-0 items-center justify-center rounded-10 font-bold text-white typo-footnote"
    style={{ background }}
    aria-hidden
  >
    {initial}
  </span>
);

const CommentRow = ({ comment }: { comment: ChatterComment }): ReactElement => {
  const hasUpvotes = !!comment.upvotes && comment.upvotes > 0;
  const hasReplies = !!comment.replies && comment.replies > 0;

  return (
    <div className="flex gap-3 border-t border-border-subtlest-tertiary py-3 first:border-t-0">
      <Avatar
        background={comment.avatar}
        initial={comment.author.replace(/[@u/]/g, '').charAt(0).toUpperCase()}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-x-2">
          <Typography
            type={TypographyType.Subhead}
            bold
            tag={TypographyTag.Span}
          >
            {comment.author}
          </Typography>
          {comment.handle && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              tag={TypographyTag.Span}
            >
              {comment.handle}
            </Typography>
          )}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            tag={TypographyTag.Span}
          >
            · {comment.timeAgo}
          </Typography>
        </div>
        <Typography type={TypographyType.Callout} className="break-words">
          {comment.text}
        </Typography>
        {(hasUpvotes || hasReplies) && (
          <div className="mt-2 flex items-center gap-4 text-text-tertiary typo-footnote">
            {hasUpvotes && (
              <span className="flex items-center gap-1">
                <UpvoteIcon size={IconSize.XSmall} />{' '}
                {largeNumberFormat(comment.upvotes)}
              </span>
            )}
            {hasReplies && (
              <span className="flex items-center gap-1">
                <DiscussIcon size={IconSize.XSmall} />{' '}
                {largeNumberFormat(comment.replies)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatterPlatformCardProps {
  source: ChatterSource;
}

export const ChatterPlatformCard = ({
  source,
}: ChatterPlatformCardProps): ReactElement => {
  const visual = platformVisuals[source.platform];
  const [isOpen, toggleOpen] = useToggle(source.defaultOpen ?? false);
  const chipStyle: CSSProperties | undefined = visual.chipColor
    ? { background: visual.chipColor }
    : undefined;

  return (
    <div className="relative min-w-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <span
        className={classNames(
          'absolute inset-y-0 left-0 w-[3px]',
          visual.chipClassName,
        )}
        style={chipStyle}
        aria-hidden
      />

      <div className="flex items-center gap-3 py-3 pl-5 pr-4">
        <span
          className={classNames(
            'flex size-8 shrink-0 items-center justify-center rounded-10',
            visual.chipClassName,
            visual.markClassName,
          )}
          style={chipStyle}
        >
          {visual.mark}
        </span>
        <div className="min-w-0 flex-1">
          <Typography type={TypographyType.Callout} bold className="truncate">
            {source.heading}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {source.subtitle}
          </Typography>
        </div>
        <div className="hidden shrink-0 gap-1.5 tablet:flex">
          {source.stats.map((stat) => (
            <span
              key={stat.label}
              className="rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 font-bold text-text-secondary typo-caption1"
            >
              {stat.value} {stat.label}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-3 pl-5 pr-4">
        <span className="mb-1.5 flex items-center gap-1 font-bold uppercase tracking-wider text-action-plus-default typo-caption1">
          <AiIcon size={IconSize.XSmall} /> AI summary
        </span>
        <Typography type={TypographyType.Callout}>
          <b>{source.mood}</b> {source.summary}
        </Typography>
      </div>

      <button
        type="button"
        onClick={() => toggleOpen()}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border-t border-border-subtlest-tertiary py-3 pl-5 pr-4 font-bold text-text-secondary typo-callout hover:bg-surface-hover"
      >
        {isOpen ? 'Hide' : `Show top ${source.comments.length}`}
        <ArrowIcon
          size={IconSize.Small}
          className={isOpen ? undefined : 'rotate-180'}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col pb-2 pl-5 pr-4">
          {source.comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      <div className="border-t border-border-subtlest-tertiary py-3 pl-5 pr-4">
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 font-bold text-text-link typo-footnote hover:underline"
        >
          {source.sourceLabel}
          <OpenLinkIcon size={IconSize.XSmall} />
        </a>
      </div>
    </div>
  );
};
