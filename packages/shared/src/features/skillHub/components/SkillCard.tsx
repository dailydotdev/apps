import type { ReactElement, MouseEvent } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { LazyImage } from '../../../components/LazyImage';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import Link from '../../../components/utilities/Link';
import { UpvoteIcon, DownloadIcon, DiscussIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { fallbackImages } from '../../../lib/config';

const NEW_SKILL_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isNewSkill = (createdAt: string): boolean => {
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  return Date.now() - createdAtMs <= NEW_SKILL_DAYS * DAY_IN_MS;
};

interface SkillCardProps {
  skill: Skill;
  className?: string;
}

export const SkillCard = forwardRef<HTMLAnchorElement, SkillCardProps>(
  function SkillCardComponent({ skill, className }: SkillCardProps, ref): ReactElement {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
      event.preventDefault();
    };

    const formattedUpvotes = largeNumberFormat(skill.upvotes) || '0';
    const formattedComments = largeNumberFormat(skill.comments) || '0';
    const formattedInstalls = largeNumberFormat(skill.installs) || '0';
    const newBadge = isNewSkill(skill.createdAt);

    return (
      <Link href="#" passHref prefetch={false}>
        <a
          ref={ref}
          onClick={handleClick}
          className={classNames(
            'group flex h-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition'
              + ' hover:border-border-subtlest-secondary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2'
              + ' focus-visible:ring-accent-bun-default focus-visible:ring-offset-2',
            className,
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-10 border border-border-subtlest-tertiary bg-surface-primary px-2 py-1 text-text-tertiary typo-caption2">
              {skill.category}
            </span>
            {newBadge && (
              <span className="rounded-10 bg-action-upvote-float px-2 py-1 text-accent-avocado-default typo-caption2">
                New
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title4}
              className="line-clamp-1"
            >
              {skill.displayName}
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Body}
              className="line-clamp-2 text-text-secondary"
            >
              {skill.description}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {skill.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-10 border border-border-subtlest-tertiary bg-surface-primary px-2 py-1 text-text-tertiary typo-caption2"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <LazyImage
                className="h-9 w-9 rounded-12"
                imgAlt={skill.author.name}
                imgSrc={skill.author.image}
                fallbackSrc={fallbackImages.avatar}
              />
              <div className="min-w-0">
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  className="truncate"
                >
                  {skill.author.name}
                </Typography>
                <span
                  className={classNames(
                    'inline-flex w-fit items-center rounded-10 border px-2 py-0.5 typo-caption2',
                    skill.author.isAgent
                      ? 'border-accent-bun-default/40 text-accent-bun-default'
                      : 'border-border-subtlest-tertiary text-text-tertiary',
                  )}
                >
                  {skill.author.isAgent ? 'Agent' : 'Human'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-text-tertiary">
              <div className="flex items-center gap-1">
                <UpvoteIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  {formattedUpvotes}
                </Typography>
              </div>
              <div className="flex items-center gap-1">
                <DiscussIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  {formattedComments}
                </Typography>
              </div>
              <div className="flex items-center gap-1">
                <DownloadIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  {formattedInstalls}
                </Typography>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  },
);
