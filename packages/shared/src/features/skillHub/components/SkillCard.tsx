import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { LazyImage } from '../../../components/LazyImage';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  UpvoteIcon,
  DownloadIcon,
  DiscussIcon,
  SparkleIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { fallbackImages } from '../../../lib/config';

const NEW_SKILL_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MOCK_NOW = Date.parse('2026-02-10T00:00:00Z');

const isNewSkill = (createdAt: string): boolean => {
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  return MOCK_NOW - createdAtMs <= NEW_SKILL_DAYS * DAY_IN_MS;
};

interface SkillCardProps {
  skill: Skill;
  className?: string;
}

const formatCount = (value: number): string => {
  return largeNumberFormat(value) || '0';
};

const getCategoryColor = (
  category: string,
): { bg: string; text: string; border: string } => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'Code Review': {
      bg: 'bg-accent-cabbage-subtlest',
      text: 'text-accent-cabbage-default',
      border: 'border-accent-cabbage-default/30',
    },
    Database: {
      bg: 'bg-accent-water-subtlest',
      text: 'text-accent-water-default',
      border: 'border-accent-water-default/30',
    },
    DevOps: {
      bg: 'bg-accent-onion-subtlest',
      text: 'text-accent-onion-default',
      border: 'border-accent-onion-default/30',
    },
    Testing: {
      bg: 'bg-accent-cheese-subtlest',
      text: 'text-accent-cheese-default',
      border: 'border-accent-cheese-default/30',
    },
    Documentation: {
      bg: 'bg-accent-blueCheese-subtlest',
      text: 'text-accent-blueCheese-default',
      border: 'border-accent-blueCheese-default/30',
    },
    Security: {
      bg: 'bg-accent-ketchup-subtlest',
      text: 'text-accent-ketchup-default',
      border: 'border-accent-ketchup-default/30',
    },
    Design: {
      bg: 'bg-accent-bacon-subtlest',
      text: 'text-accent-bacon-default',
      border: 'border-accent-bacon-default/30',
    },
  };

  return (
    colors[category] || {
      bg: 'bg-surface-primary',
      text: 'text-text-tertiary',
      border: 'border-border-subtlest-tertiary',
    }
  );
};

export const SkillCard = ({
  skill,
  className,
}: SkillCardProps): ReactElement => {
  const newBadge = isNewSkill(skill.createdAt);
  const categoryColor = getCategoryColor(skill.category);

  return (
    <button
      type="button"
      aria-label={`Open ${skill.displayName}`}
      className={classNames(
        'group relative flex h-full w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2',
        className,
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-16 bg-gradient-to-br from-accent-cabbage-default/0 to-accent-onion-default/0 opacity-0 transition-opacity duration-200 group-hover:opacity-5" />

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={classNames(
            'rounded-10 border px-2 py-1 typo-caption2 transition-colors',
            categoryColor.bg,
            categoryColor.text,
            categoryColor.border,
          )}
        >
          {skill.category}
        </span>
        <div className="flex items-center gap-2">
          {skill.trending && (
            <span className="flex items-center gap-1 rounded-10 bg-accent-cheese-subtlest px-2 py-1 text-accent-cheese-default typo-caption2">
              <SparkleIcon size={IconSize.Size12} />
              Hot
            </span>
          )}
          {newBadge && (
            <span className="rounded-10 bg-accent-avocado-subtlest px-2 py-1 text-accent-avocado-default typo-caption2">
              New
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-2">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          className="line-clamp-1 transition-colors group-hover:text-accent-cabbage-default"
        >
          {skill.displayName}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          className="line-clamp-2 text-text-secondary"
        >
          {skill.description}
        </Typography>

        {/* Tags */}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-8 bg-surface-primary px-2 py-0.5 text-text-quaternary typo-caption2 transition-colors group-hover:bg-surface-secondary group-hover:text-text-tertiary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-3">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <LazyImage
              className="h-8 w-8 rounded-10"
              imgAlt={skill.author.name}
              imgSrc={skill.author.image}
              fallbackSrc={fallbackImages.avatar}
            />
            {skill.author.isAgent && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-bun-default text-[8px] text-white shadow-1">
                🤖
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              className="truncate font-medium"
            >
              {skill.author.name}
            </Typography>
            <span
              className={classNames(
                'typo-caption2',
                skill.author.isAgent
                  ? 'text-accent-bun-default'
                  : 'text-text-quaternary',
              )}
            >
              {skill.author.isAgent ? 'Agent' : 'Human'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-text-tertiary">
          <div className="flex items-center gap-1.5 transition-colors hover:text-accent-avocado-default">
            <UpvoteIcon size={IconSize.Size16} />
            <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
              {formatCount(skill.upvotes)}
            </Typography>
          </div>
          <div className="flex items-center gap-1.5 transition-colors hover:text-accent-blueCheese-default">
            <DiscussIcon size={IconSize.Size16} />
            <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
              {formatCount(skill.comments)}
            </Typography>
          </div>
          <div className="flex items-center gap-1.5 transition-colors hover:text-accent-cabbage-default">
            <DownloadIcon size={IconSize.Size16} />
            <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
              {formatCount(skill.installs)}
            </Typography>
          </div>
        </div>
      </div>
    </button>
  );
};
