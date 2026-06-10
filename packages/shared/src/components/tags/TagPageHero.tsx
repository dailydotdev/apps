import type { ReactElement, ReactNode } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BlockIcon, PlusIcon } from '../icons';
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

const TagStatTicker = ({ stats }: { stats: TagPageStat[] }): ReactElement => (
  <dl className="flex flex-wrap items-center gap-x-6 gap-y-4">
    {stats.map((stat, index) => (
      <Fragment key={stat.label}>
        {index > 0 && (
          <span
            aria-hidden
            className="hidden h-9 w-px bg-border-subtlest-tertiary mobileL:block"
          />
        )}
        <div className="flex flex-col">
          <dd className="font-bold tabular-nums text-text-primary typo-title1">
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
        'flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-5 laptop:p-8',
        className,
      )}
    >
      {sponsoredHero}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start laptop:justify-between">
          <div className="min-w-0">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.LargeTitle}
              bold
              className="break-words laptop:typo-mega2"
            >
              <span className="text-accent-cabbage-default">#</span>
              {title}
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
        <div className="border-t border-border-subtlest-tertiary pt-6">
          <TagStatTicker stats={stats} />
        </div>
      )}

      {(recommendedTags || roadmap) && (
        <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-6">
          {recommendedTags}
          {roadmap}
        </div>
      )}

      {crawlLinks}
    </section>
  );
};
