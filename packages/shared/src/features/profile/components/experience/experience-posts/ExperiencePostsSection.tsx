import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../../components/typography/Typography';
import { ArrowIcon, HashtagIcon } from '../../../../../components/icons';
import { IconSize } from '../../../../../components/Icon';
import { Pill, PillSize } from '../../../../../components/Pill';
import type { ExperiencePost } from './types';
import { ExperiencePostType } from './types';
import { ExperiencePostItem } from './ExperiencePostItem';

const TYPE_LABELS: Record<ExperiencePostType | 'all', string> = {
  all: 'All',
  [ExperiencePostType.Milestone]: 'Milestones',
  [ExperiencePostType.Publication]: 'Publications',
  [ExperiencePostType.Project]: 'Projects',
  [ExperiencePostType.Media]: 'Media',
  [ExperiencePostType.Achievement]: 'Achievements',
  [ExperiencePostType.OpenSource]: 'Open Source',
};

interface ExperiencePostsSectionProps {
  posts: ExperiencePost[];
  initiallyOpen?: boolean;
}

export function ExperiencePostsSection({
  posts,
  initiallyOpen = false,
}: ExperiencePostsSectionProps): ReactElement {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [activeFilter, setActiveFilter] = useState<ExperiencePostType | 'all'>(
    'all',
  );
  const [showAll, setShowAll] = useState(false);

  // Get unique post types for filter tabs
  const availableTypes = useMemo(() => {
    const types = new Set(posts.map((p) => p.type));
    return Array.from(types);
  }, [posts]);

  // Filter posts by type
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') {
      return posts;
    }
    return posts.filter((p) => p.type === activeFilter);
  }, [posts, activeFilter]);

  // Limit visible posts
  const visiblePosts = showAll ? filteredPosts : filteredPosts.slice(0, 3);
  const hiddenCount = filteredPosts.length - 3;

  // Count by type for preview
  const typeCounts = useMemo(() => {
    return posts.reduce((acc, post) => {
      acc[post.type] = (acc[post.type] || 0) + 1;
      return acc;
    }, {} as Record<ExperiencePostType, number>);
  }, [posts]);

  return (
    <div className="mt-3 flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      {/* Header */}
      <button
        type="button"
        className={classNames(
          'flex w-full items-center justify-between px-4 py-3',
          'bg-surface-float transition-colors hover:bg-surface-hover',
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <HashtagIcon size={IconSize.Medium} className="text-text-secondary" />
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <Typography type={TypographyType.Callout} bold>
                Highlights & Posts
              </Typography>
              <Pill
                label={`${posts.length} ${
                  posts.length === 1 ? 'item' : 'items'
                }`}
                size={PillSize.Small}
                className="bg-surface-tertiary text-text-tertiary"
              />
            </div>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Milestones, publications, projects & more
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick preview when collapsed */}
          {!isOpen && (
            <div className="hidden items-center gap-1.5 tablet:flex">
              {availableTypes.slice(0, 3).map((type) => (
                <Pill
                  key={type}
                  label={`${typeCounts[type]} ${TYPE_LABELS[type]}`}
                  size={PillSize.Small}
                  className="bg-surface-tertiary text-text-quaternary"
                />
              ))}
            </div>
          )}
          <ArrowIcon
            size={IconSize.Small}
            className={classNames(
              'text-text-tertiary transition-transform duration-200',
              { 'rotate-180': !isOpen },
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={classNames(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col border-t border-border-subtlest-tertiary">
          {/* Filter tabs */}
          {availableTypes.length > 1 && (
            <div className="flex gap-1 overflow-x-auto p-3 pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={classNames(
                  'rounded-10 px-3 py-1.5 transition-colors typo-caption1',
                  activeFilter === 'all'
                    ? 'bg-surface-tertiary font-bold text-text-primary'
                    : 'text-text-tertiary hover:bg-surface-hover',
                )}
              >
                All ({posts.length})
              </button>
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveFilter(type)}
                  className={classNames(
                    'whitespace-nowrap rounded-10 px-3 py-1.5 transition-colors typo-caption1',
                    activeFilter === type
                      ? 'bg-surface-tertiary font-bold text-text-primary'
                      : 'text-text-tertiary hover:bg-surface-hover',
                  )}
                >
                  {TYPE_LABELS[type]} ({typeCounts[type]})
                </button>
              ))}
            </div>
          )}

          {/* Posts list */}
          <div className="flex flex-col p-2">
            {visiblePosts.map((post, index) => (
              <div
                key={post.id}
                className={classNames({
                  'border-t border-border-subtlest-tertiary': index > 0,
                })}
              >
                <ExperiencePostItem post={post} />
              </div>
            ))}
          </div>

          {/* Show more/less */}
          {hiddenCount > 0 && !showAll && (
            <button
              type="button"
              className="border-t border-border-subtlest-tertiary px-3 py-2.5 text-center transition-colors hover:bg-surface-hover"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
            >
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Link}
              >
                Show {hiddenCount} more {hiddenCount === 1 ? 'item' : 'items'}
              </Typography>
            </button>
          )}
          {showAll && filteredPosts.length > 3 && (
            <button
              type="button"
              className="border-t border-border-subtlest-tertiary px-3 py-2.5 text-center transition-colors hover:bg-surface-hover"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(false);
              }}
            >
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Link}
              >
                Show less
              </Typography>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
