import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ArrowIcon,
  DiscussIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ProfilePicture,
  ProfileImageSize,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { StoryDetail } from './StoryDetail';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface StoryRowProps {
  story: StoryItem;
  isRead: boolean;
  onRead: () => void;
  isLead?: boolean;
}

const startTransition = (update: () => void): void => {
  if (typeof document === 'undefined') {
    update();
    return;
  }
  const api = (
    document as unknown as {
      startViewTransition?: (cb: () => void) => void;
    }
  ).startViewTransition;
  if (api) {
    api.call(document, update);
    return;
  }
  update();
};

const SourceStack = ({
  story,
  size = 'sm',
}: {
  story: StoryItem;
  size?: 'sm' | 'md';
}): ReactElement => {
  const shown = story.sources.slice(0, 4);
  const remaining = story.sources.length - shown.length;
  const dimension = size === 'md' ? 'size-7' : 'size-5';
  const overlap = size === 'md' ? '-ml-2' : '-ml-1.5';
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {shown.map((src, idx) => (
        <span
          key={src.sourceId}
          className={classNames(
            'overflow-hidden rounded-6 border-2 border-background-default bg-surface-float',
            dimension,
            idx === 0 ? '' : overlap,
          )}
          title={src.sourceName}
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
        <span
          className={classNames(
            'inline-grid place-items-center rounded-6 border-2 border-background-default bg-background-subtle px-1 text-text-secondary',
            dimension,
            overlap,
          )}
        >
          <Typography type={TypographyType.Caption2} bold>
            +{remaining}
          </Typography>
        </span>
      ) : null}
    </span>
  );
};

const QuotePull = ({ story }: { story: StoryItem }): ReactElement | null => {
  const top = story.highlightedComments[0];
  if (!top) {
    return null;
  }
  const clean = top.content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1')
    .trim();
  const short = clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
  return (
    <figure className="mt-3 flex gap-3 border-l-2 border-border-subtlest-secondary pl-3">
      <ProfilePicture
        user={{
          id: top.username,
          username: top.username,
          image: top.userImage,
        }}
        size={ProfileImageSize.Small}
        rounded="full"
      />
      <div className="flex flex-col gap-1">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="italic"
        >
          “{short}”
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          @{top.username} ·{' '}
          <span className="inline-flex items-center gap-1 align-middle">
            <UpvoteIcon size={IconSize.XXSmall} /> {top.upvotes}
          </span>
        </Typography>
      </div>
    </figure>
  );
};

export const StoryRow = ({
  story,
  isRead,
  onRead,
  isLead,
}: StoryRowProps): ReactElement => {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    startTransition(() => {
      setOpen((prev) => {
        const next = !prev;
        if (next) {
          onRead();
        }
        return next;
      });
    });
  }, [onRead]);

  return (
    <article
      className={classNames(
        'group relative flex flex-col gap-3 border-b border-border-subtlest-tertiary py-5 transition-opacity',
        isRead && !open && 'opacity-60',
      )}
    >
      <button
        type="button"
        onClick={toggle}
        className="text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-4">
          <SourceStack story={story} size={isLead ? 'md' : 'sm'} />
          <div className="flex flex-1 flex-col gap-2">
            <Typography
              type={isLead ? TypographyType.Title2 : TypographyType.Title3}
              bold
              color={
                isRead ? TypographyColor.Tertiary : TypographyColor.Primary
              }
              className={classNames(
                '!leading-snug transition-colors',
                isRead && 'decoration-text-quaternary/40 line-through',
                !isRead && 'group-hover:text-brand-default',
              )}
            >
              {story.title}
            </Typography>
            {!open && isLead ? <QuotePull story={story} /> : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-tertiary">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {briefCopy.storyMeta(story.totalUpvotes, story.totalComments)}
              </Typography>
              <span className="inline-flex items-center gap-1">
                <DiscussIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {story.posts.length} sources
                </Typography>
              </span>
            </div>
          </div>
          <span
            className="mt-1 inline-grid size-7 place-items-center rounded-full text-text-tertiary transition-colors group-hover:bg-surface-float group-hover:text-text-primary"
            aria-hidden
          >
            <ArrowIcon
              size={IconSize.XSmall}
              className={classNames(
                'transition-transform',
                open ? 'rotate-0' : 'rotate-180',
              )}
            />
          </span>
        </div>
      </button>
      <div
        className={classNames(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <StoryDetail story={story} />
        </div>
      </div>
    </article>
  );
};
