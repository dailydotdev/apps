import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { BlockIcon, HashtagIcon, PlusIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export type TagStatus = 'followed' | 'blocked' | 'unfollowed';

export interface TagPageStat {
  label: string;
  value: string;
  caption: string;
}

interface TagStatsBarProps {
  stats: TagPageStat[];
}

const TagStatsBar = ({ stats }: TagStatsBarProps): ReactElement => (
  <dl className="grid grid-cols-2 gap-2 laptop:grid-cols-4">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="rounded-14 border border-border-subtlest-tertiary bg-surface-float p-3 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
      >
        <dt className="text-text-tertiary typo-caption1">{stat.label}</dt>
        <dd className="mt-1 font-bold text-text-primary typo-title3">
          {stat.value}
        </dd>
        <p className="mt-1 text-text-quaternary typo-caption1">
          {stat.caption}
        </p>
      </div>
    ))}
  </dl>
);

interface TagPageHeroProps {
  tag: string;
  title: string;
  description?: string;
  stats: TagPageStat[];
  tagStatus: TagStatus;
  followButtonProps: ButtonProps<'button'>;
  blockButtonProps: ButtonProps<'button'>;
  optionsMenu: ReactNode;
  sponsoredHero?: ReactNode;
  recommendedTags?: ReactNode;
  roadmap?: ReactNode;
  crawlLinks?: ReactNode;
  className?: string;
}

export const TagPageHero = ({
  tag,
  title,
  description,
  stats,
  tagStatus,
  followButtonProps,
  blockButtonProps,
  optionsMenu,
  sponsoredHero,
  recommendedTags,
  roadmap,
  crawlLinks,
  className,
}: TagPageHeroProps): ReactElement => (
  <section
    className={classNames(
      'shadow-1 relative mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-4 laptop:p-6',
      className,
    )}
  >
    <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-20 -top-20 size-64 rounded-full blur-3xl" />
    <div className="bg-accent-onion-default/15 pointer-events-none absolute -right-16 top-8 size-52 rounded-full blur-3xl" />
    <div className="bg-accent-cheese-default/10 pointer-events-none absolute bottom-0 left-1/3 size-40 rounded-full blur-3xl" />

    <div className="relative flex flex-col gap-5">
      {sponsoredHero}
      <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start laptop:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="border-accent-cabbage-default/30 inline-flex items-center gap-1.5 rounded-full border bg-accent-cabbage-subtlest px-3 py-1 font-bold text-accent-cabbage-default typo-caption1">
              <HashtagIcon size={IconSize.Size16} />
              Developer topic
            </span>
            <span className="rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-text-tertiary typo-caption1">
              Updated daily
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <HashtagIcon
              size={IconSize.XXLarge}
              className="hidden shrink-0 text-accent-cabbage-default mobileL:block"
            />
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Mega2}
              bold
              className="min-w-0 break-words bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent"
            >
              {title}
            </Typography>
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="mt-3 max-w-[45rem]"
          >
            {description ||
              `Follow #${tag} to turn this topic into a personalized daily.dev feed.`}
          </Typography>
        </div>

        <div className="flex shrink-0 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 laptop:min-w-60">
          {tagStatus !== 'blocked' && (
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              icon={<PlusIcon />}
              bold
              {...followButtonProps}
              aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
              className={classNames('w-full', followButtonProps.className)}
            >
              {tagStatus === 'followed'
                ? `Following #${tag}`
                : `Follow #${tag}`}
            </Button>
          )}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="px-1"
          >
            {tagStatus === 'blocked'
              ? 'This topic is blocked from your feed.'
              : 'Build a personal feed from this topic. Free, no card.'}
          </Typography>
          <div className="flex gap-2">
            {tagStatus !== 'followed' && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<BlockIcon />}
                {...blockButtonProps}
                aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
                className={classNames('flex-1', blockButtonProps.className)}
              >
                {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
              </Button>
            )}
            {optionsMenu}
          </div>
        </div>
      </div>

      {stats.length > 0 && <TagStatsBar stats={stats} />}
      {recommendedTags}
      {roadmap}
      {crawlLinks}
    </div>
  </section>
);
