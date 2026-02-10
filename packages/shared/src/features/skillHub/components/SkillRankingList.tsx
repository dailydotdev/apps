import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { SkillDetailModal } from './SkillDetailModal';
import { LazyImage } from '../../../components/LazyImage';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  UpvoteIcon,
  DownloadIcon,
  MedalBadgeIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { fallbackImages } from '../../../lib/config';

interface SkillRankingListProps {
  title: string;
  skills: Skill[];
  className?: string;
}

const getRankStyle = (
  index: number,
): { bg: string; text: string; border: string; glow?: string } => {
  if (index === 0) {
    return {
      bg: 'bg-gradient-to-br from-accent-cheese-default to-accent-burger-default',
      text: 'text-white',
      border: 'border-accent-cheese-default/50',
      glow: 'shadow-[0_0_12px_rgba(255,199,0,0.3)]',
    };
  }
  if (index === 1) {
    return {
      bg: 'bg-gradient-to-br from-accent-salt-subtle to-accent-salt-default',
      text: 'text-white',
      border: 'border-accent-salt-default/50',
      glow: 'shadow-[0_0_8px_rgba(192,192,192,0.3)]',
    };
  }
  if (index === 2) {
    return {
      bg: 'bg-gradient-to-br from-accent-burger-subtle to-accent-burger-default',
      text: 'text-white',
      border: 'border-accent-burger-default/50',
      glow: 'shadow-[0_0_8px_rgba(205,127,50,0.3)]',
    };
  }
  return {
    bg: 'bg-surface-secondary',
    text: 'text-text-tertiary',
    border: 'border-border-subtlest-tertiary',
  };
};

export const SkillRankingList = ({
  title,
  skills,
  className,
}: SkillRankingListProps): ReactElement => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  return (
    <>
      <section className={classNames('flex flex-col gap-4', className)}>
        <div className="flex items-center gap-3">
          <MedalBadgeIcon
            size={IconSize.Medium}
            className="text-accent-cheese-default"
          />
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3}>
            {title}
          </Typography>
        </div>

        <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
          {skills.map((skill, index) => {
          const rankStyle = getRankStyle(index);
          const isTopThree = index < 3;

          return (
            <button
              key={skill.id}
              type="button"
              aria-label={`View ${skill.displayName}`}
              onClick={() => handleSkillClick(skill)}
              className={classNames(
                'group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-surface-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cabbage-default',
                index !== skills.length - 1 &&
                  'border-b border-border-subtlest-tertiary',
              )}
            >
              {/* Rank badge */}
              <div
                className={classNames(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-10 border font-bold',
                  rankStyle.bg,
                  rankStyle.text,
                  rankStyle.border,
                  rankStyle.glow,
                  isTopThree ? 'typo-callout' : 'typo-footnote',
                )}
              >
                {index + 1}
              </div>

              {/* Author avatar */}
              <div className="relative flex-shrink-0">
                <LazyImage
                  className="h-10 w-10 rounded-12"
                  imgAlt={skill.author.name}
                  imgSrc={skill.author.image}
                  fallbackSrc={fallbackImages.avatar}
                />
                {skill.author.isAgent && (
                  <span className="shadow-1 absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-bun-default text-[8px] text-white">
                    🤖
                  </span>
                )}
              </div>

              {/* Skill info */}
              <div className="min-w-0 flex-1">
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  bold
                  className="truncate transition-colors group-hover:text-accent-cabbage-default"
                >
                  {skill.displayName}
                </Typography>
                <div className="flex items-center gap-2">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    className="text-text-tertiary"
                  >
                    by {skill.author.name}
                  </Typography>
                  <span className="h-1 w-1 rounded-full bg-border-subtlest-secondary" />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    className="text-text-quaternary"
                  >
                    {skill.category}
                  </Typography>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-shrink-0 items-center gap-4">
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <DownloadIcon size={IconSize.Size16} />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    className="hidden tablet:inline"
                  >
                    {largeNumberFormat(skill.installs) || '0'}
                  </Typography>
                </div>
                <div
                  className={classNames(
                    'flex items-center gap-1.5 rounded-8 px-2 py-1',
                    isTopThree
                      ? 'bg-accent-avocado-default text-white'
                      : 'text-text-tertiary',
                  )}
                >
                  <UpvoteIcon size={IconSize.Size16} />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    bold={isTopThree}
                  >
                    {largeNumberFormat(skill.upvotes) || '0'}
                  </Typography>
                </div>
              </div>
            </button>
          );
        })}
        </div>
      </section>
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          isOpen={Boolean(selectedSkill)}
          onRequestClose={handleCloseModal}
        />
      )}
    </>
  );
};
