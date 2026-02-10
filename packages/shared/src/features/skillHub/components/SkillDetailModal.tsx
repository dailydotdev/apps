import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../../components/modals/common/types';
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
  CalendarIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { fallbackImages } from '../../../lib/config';

interface SkillDetailModalProps {
  skill: Skill;
  isOpen: boolean;
  onRequestClose: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const SkillDetailModal = ({
  skill,
  isOpen,
  onRequestClose,
}: SkillDetailModalProps): ReactElement => {
  const categoryColor = getCategoryColor(skill.category);

  return (
    <Modal
      isOpen={isOpen}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border-subtlest-tertiary p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={classNames(
                    'rounded-10 border px-2 py-1 typo-caption2',
                    categoryColor.bg,
                    categoryColor.text,
                    categoryColor.border,
                  )}
                >
                  {skill.category}
                </span>
                {skill.trending && (
                  <span className="rounded-10 bg-accent-cheese-subtlest px-2 py-1 text-accent-cheese-default typo-caption2">
                    🔥 Trending
                  </span>
                )}
              </div>
              <Typography tag={TypographyTag.H2} type={TypographyType.Title2}>
                {skill.displayName}
              </Typography>
            </div>
            <button
              type="button"
              onClick={onRequestClose}
              className="flex h-8 w-8 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <LazyImage
                className="h-10 w-10 rounded-12"
                imgAlt={skill.author.name}
                imgSrc={skill.author.image}
                fallbackSrc={fallbackImages.avatar}
              />
              {skill.author.isAgent && (
                <span className="shadow-1 absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-bun-default text-[10px] text-white">
                  🤖
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                bold
              >
                {skill.author.name}
              </Typography>
              <span
                className={classNames(
                  'typo-caption1',
                  skill.author.isAgent
                    ? 'text-accent-bun-default'
                    : 'text-text-quaternary',
                )}
              >
                {skill.author.isAgent ? 'AI Agent' : 'Human Creator'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          {/* Description */}
          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Callout}
              bold
            >
              About
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Body}
              className="text-text-secondary"
            >
              {skill.description}
            </Typography>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Callout}
              bold
            >
              Tags
            </Typography>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-10 bg-surface-secondary px-3 py-1 text-text-secondary typo-footnote"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Callout}
              bold
            >
              Stats
            </Typography>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-text-tertiary">
                <UpvoteIcon size={IconSize.Medium} />
                <div className="flex flex-col">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    bold
                    className="text-text-primary"
                  >
                    {largeNumberFormat(skill.upvotes) || '0'}
                  </Typography>
                  <span className="typo-caption2">Upvotes</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <DiscussIcon size={IconSize.Medium} />
                <div className="flex flex-col">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    bold
                    className="text-text-primary"
                  >
                    {largeNumberFormat(skill.comments) || '0'}
                  </Typography>
                  <span className="typo-caption2">Comments</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <DownloadIcon size={IconSize.Medium} />
                <div className="flex flex-col">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    bold
                    className="text-text-primary"
                  >
                    {largeNumberFormat(skill.installs) || '0'}
                  </Typography>
                  <span className="typo-caption2">Installs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-6 text-text-quaternary">
            <div className="flex items-center gap-2">
              <CalendarIcon size={IconSize.Size16} />
              <span className="typo-caption1">
                Created {formatDate(skill.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon size={IconSize.Size16} />
              <span className="typo-caption1">
                Updated {formatDate(skill.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border-subtlest-tertiary p-6">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={onRequestClose}
          >
            Close
          </Button>
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Medium}>
            <DownloadIcon size={IconSize.Size16} className="mr-2" />
            Install Skill
          </Button>
        </div>
      </div>
    </Modal>
  );
};
