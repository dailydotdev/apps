import type { ReactElement, ReactNode } from 'react';
import React, { Fragment } from 'react';
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
  caption?: string;
}

interface TagStatTickerProps {
  stats: TagPageStat[];
}

const TagStatTicker = ({ stats }: TagStatTickerProps): ReactElement => (
  <dl className="flex flex-wrap items-center gap-x-5 gap-y-3">
    {stats.map((stat, index) => (
      <Fragment key={stat.label}>
        {index > 0 && (
          <span
            aria-hidden
            className="hidden h-8 w-px bg-border-subtlest-tertiary mobileL:block"
          />
        )}
        <div className="flex flex-col">
          <dd className="font-bold tabular-nums text-text-primary typo-title2">
            {stat.value}
          </dd>
          <dt className="text-text-tertiary typo-caption1">{stat.label}</dt>
        </div>
      </Fragment>
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
}: TagPageHeroProps): ReactElement => {
  const microcopy = {
    blocked: 'This topic is blocked from your feed.',
    followed: `#${tag} is shaping your feed.`,
    unfollowed:
      'Free account, no card. Your feed starts learning the moment you follow.',
  }[tagStatus];

  return (
    <section
      className={classNames(
        'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-5 laptop:p-8',
        className,
      )}
    >
      <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/15 pointer-events-none absolute -right-20 -top-10 size-64 rounded-full blur-3xl" />

      <div className="relative flex flex-col gap-6">
        {sponsoredHero}

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
            <span className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default">
              <HashtagIcon size={IconSize.Size16} />
              Topic
            </span>
            <span aria-hidden>·</span>
            <span>Updated daily</span>
          </div>

          <div className="flex flex-col gap-4 laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="min-w-0">
              <Typography
                tag={TypographyTag.H1}
                type={TypographyType.LargeTitle}
                bold
                className="break-words bg-gradient-to-r from-text-primary to-accent-cabbage-bolder bg-clip-text text-transparent laptop:typo-mega2"
              >
                #{title}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="mt-3 max-w-[44rem]"
              >
                {description ||
                  `Everything developers are reading, saving, upvoting, and debating around #${tag} — curated first, then the full live stream.`}
              </Typography>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {tagStatus !== 'blocked' && (
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Large}
                  icon={<PlusIcon />}
                  bold
                  {...followButtonProps}
                  aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
                  className={classNames(followButtonProps.className)}
                >
                  {tagStatus === 'followed'
                    ? `Following #${tag}`
                    : `Follow #${tag}`}
                </Button>
              )}
              {tagStatus !== 'followed' && (
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Large}
                  icon={<BlockIcon />}
                  {...blockButtonProps}
                  aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
                >
                  {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
                </Button>
              )}
              {optionsMenu}
            </div>
          </div>

          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {microcopy}
          </Typography>
        </div>

        {stats.length > 0 && (
          <div className="border-t border-border-subtlest-tertiary pt-5">
            <TagStatTicker stats={stats} />
          </div>
        )}

        {(recommendedTags || roadmap) && (
          <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-5">
            {recommendedTags}
            {roadmap}
          </div>
        )}

        {crawlLinks}
      </div>
    </section>
  );
};
