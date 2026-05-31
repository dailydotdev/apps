import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import {
  ArrowIcon,
  BlockIcon,
  DiscussIcon,
  HashtagIcon,
  PlusIcon,
  SparkleIcon,
  TrendingIcon,
  UpvoteIcon,
} from '../icons';
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
  <dl className="grid grid-cols-1 gap-2 mobileL:grid-cols-2 laptop:grid-cols-4">
    {stats.map((stat, index) => (
      <div
        key={stat.label}
        className="group relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2"
      >
        <div className="from-accent-cabbage-default/0 to-accent-onion-default/0 group-hover:opacity-5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200" />
        <dt className="relative flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
          {stat.label}
          <span className="rounded-8 bg-surface-hover px-1.5 py-0.5 font-bold text-text-quaternary typo-caption2">
            0{index + 1}
          </span>
        </dt>
        <dd className="relative mt-3 font-bold text-text-primary typo-title2">
          {stat.value}
        </dd>
        <p className="relative mt-1 text-text-quaternary typo-caption1">
          {stat.caption}
        </p>
      </div>
    ))}
  </dl>
);

const HeroLink = ({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}): ReactElement => (
  <a
    href={href}
    className="group flex items-center gap-3 rounded-14 border border-border-subtlest-tertiary bg-surface-primary p-3 transition-all duration-200 hover:border-border-subtlest-secondary hover:bg-surface-hover"
  >
    <span className="flex size-9 shrink-0 items-center justify-center rounded-12 bg-surface-float text-accent-cabbage-default">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        bold
        className="block truncate"
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="block truncate"
      >
        {description}
      </Typography>
    </span>
    <ArrowIcon
      size={IconSize.XSmall}
      className="rotate-90 text-text-quaternary transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary"
    />
  </a>
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
      'relative mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 laptop:p-4',
      className,
    )}
  >
    <div className="bg-accent-cabbage-default/25 pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-3xl" />
    <div className="bg-accent-onion-default/20 pointer-events-none absolute -right-20 top-0 size-64 rounded-full blur-3xl" />
    <div className="bg-accent-cheese-default/10 pointer-events-none absolute bottom-0 left-1/3 size-56 rounded-full blur-3xl" />

    <div className="relative flex flex-col gap-3">
      {sponsoredHero}
      <div className="grid gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-5 laptop:p-7">
          <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="border-accent-cabbage-default/30 inline-flex items-center gap-1.5 rounded-full border bg-accent-cabbage-subtlest px-3 py-1 font-bold text-accent-cabbage-default typo-caption1">
                  <HashtagIcon size={IconSize.Size16} />
                  Topic intelligence hub
                </span>
                <span className="rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-text-tertiary typo-caption1">
                  Updated daily
                </span>
              </div>
              <Typography
                tag={TypographyTag.H1}
                type={TypographyType.Mega1}
                bold
                className="max-w-[43rem] break-words bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent"
              >
                #{title}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="mt-5 max-w-[42rem]"
              >
                {description ||
                  `A live map of what developers are reading, saving, upvoting, and debating around #${tag}. Start with the signal, then make it yours.`}
              </Typography>
            </div>
            <div className="grid gap-2 tablet:grid-cols-3">
              <HeroLink
                href="#top-posts"
                icon={<TrendingIcon size={IconSize.Size16} />}
                title="Start with signal"
                description="Scan top posts first"
              />
              <HeroLink
                href="#upvoted-posts"
                icon={<UpvoteIcon size={IconSize.Size16} />}
                title="Find consensus"
                description="See what developers saved"
              />
              <HeroLink
                href="#discussed-posts"
                icon={<DiscussIcon size={IconSize.Size16} />}
                title="Read the debate"
                description="Jump into the conversation"
              />
            </div>
          </div>
        </div>
        <aside className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-4">
          <div className="rounded-20 bg-surface-float p-4">
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent-cheese-subtlest px-2.5 py-1 font-bold text-accent-cheese-default typo-caption1">
              <SparkleIcon size={IconSize.Size16} />
              Your next move
            </span>
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="mt-4"
            >
              Turn #{tag} into your feed
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-2"
            >
              Follow once. daily.dev will start learning what parts of this
              topic matter to you.
            </Typography>
          </div>
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
                : `Personalize with #${tag}`}
            </Button>
          )}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="px-1"
          >
            {tagStatus === 'blocked'
              ? 'This topic is blocked from your feed.'
              : 'Free account. No card. Your feed gets smarter immediately.'}
          </Typography>
          <div className="grid grid-cols-[1fr_auto] gap-2">
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
        </aside>
      </div>

      {stats.length > 0 && <TagStatsBar stats={stats} />}
      <div className="grid gap-3 laptop:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-20 border border-border-subtlest-tertiary bg-surface-primary p-4">
          {recommendedTags}
        </div>
        {roadmap && (
          <div className="rounded-20 border border-border-subtlest-tertiary bg-surface-primary p-4">
            {roadmap}
          </div>
        )}
      </div>
      {crawlLinks}
    </div>
  </section>
);
