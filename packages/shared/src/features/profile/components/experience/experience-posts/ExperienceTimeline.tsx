import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../../../components/typography/Typography';
import {
  ArrowIcon,
  FlagIcon,
  LinkIcon,
  TerminalIcon,
  PlayIcon,
  StarIcon,
  GitHubIcon,
  OpenLinkIcon,
} from '../../../../../components/icons';
import { IconSize } from '../../../../../components/Icon';
import { Image, ImageType } from '../../../../../components/image/Image';
import type {
  ExperiencePost,
  ProjectPost,
  PublicationPost,
  MediaPost,
  AchievementPost,
  OpenSourcePost,
} from './types';
import { ExperiencePostType } from './types';

const TYPE_ICONS = {
  [ExperiencePostType.Milestone]: FlagIcon,
  [ExperiencePostType.Publication]: LinkIcon,
  [ExperiencePostType.Project]: TerminalIcon,
  [ExperiencePostType.Media]: PlayIcon,
  [ExperiencePostType.Achievement]: StarIcon,
  [ExperiencePostType.OpenSource]: GitHubIcon,
};

const TYPE_COLORS = {
  [ExperiencePostType.Milestone]: 'bg-accent-onion-default',
  [ExperiencePostType.Publication]: 'bg-accent-water-default',
  [ExperiencePostType.Project]: 'bg-accent-cabbage-default',
  [ExperiencePostType.Media]: 'bg-accent-cheese-default',
  [ExperiencePostType.Achievement]: 'bg-accent-bun-default',
  [ExperiencePostType.OpenSource]: 'bg-accent-blueCheese-default',
};

const TYPE_LABELS = {
  [ExperiencePostType.Milestone]: 'Milestone',
  [ExperiencePostType.Publication]: 'Publication',
  [ExperiencePostType.Project]: 'Project',
  [ExperiencePostType.Media]: 'Media',
  [ExperiencePostType.Achievement]: 'Achievement',
  [ExperiencePostType.OpenSource]: 'Open Source',
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

interface TimelineNodeProps {
  post: ExperiencePost;
  isLast: boolean;
}

function TimelineNode({ post, isLast }: TimelineNodeProps): ReactElement {
  const Icon = TYPE_ICONS[post.type];
  const color = TYPE_COLORS[post.type];
  const label = TYPE_LABELS[post.type];
  const dateStr = formatDate(post.date);

  const renderMeta = (): ReactElement | null => {
    switch (post.type) {
      case ExperiencePostType.Publication: {
        const pub = post as PublicationPost;
        return pub.publisher ? (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {pub.publisher}
          </Typography>
        ) : null;
      }
      case ExperiencePostType.Project: {
        const proj = post as ProjectPost;
        return proj.technologies?.length ? (
          <div className="flex flex-wrap gap-1">
            {proj.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null;
      }
      case ExperiencePostType.Media: {
        const media = post as MediaPost;
        return media.venue ? (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {media.venue}
          </Typography>
        ) : null;
      }
      case ExperiencePostType.Achievement: {
        const achievement = post as AchievementPost;
        return achievement.issuer ? (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {achievement.issuer}
          </Typography>
        ) : null;
      }
      case ExperiencePostType.OpenSource: {
        const oss = post as OpenSourcePost;
        return oss.stars ? (
          <div className="flex items-center gap-1">
            <StarIcon
              size={IconSize.XSmall}
              className="text-accent-cheese-default"
            />
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {oss.stars.toLocaleString()}
            </Typography>
          </div>
        ) : null;
      }
      default:
        return null;
    }
  };

  const content = (
    <div className="group relative flex gap-3">
      {/* Timeline connector */}
      <div className="relative flex flex-col items-center">
        {/* Node */}
        <div
          className={classNames(
            'z-10 flex h-6 w-6 items-center justify-center rounded-full',
            color,
          )}
        >
          <Icon size={IconSize.XSmall} className="text-white" />
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className="absolute top-6 h-[calc(100%+0.5rem)] w-0.5 bg-border-subtlest-tertiary" />
        )}
      </div>

      {/* Content card */}
      <div className="mb-2 flex flex-1 flex-col gap-1.5 pb-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                {label}
              </Typography>
              <span className="text-text-quaternary">·</span>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                {dateStr}
              </Typography>
            </div>
            <Typography type={TypographyType.Subhead} bold>
              {post.title}
            </Typography>
          </div>

          {/* Thumbnail */}
          {post.image && (
            <Image
              className="h-10 w-10 flex-shrink-0 rounded-10 object-cover"
              type={ImageType.Post}
              src={post.image}
              alt={post.title}
            />
          )}
        </div>

        {/* Description */}
        {post.description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="line-clamp-2"
          >
            {post.description}
          </Typography>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between">
          {renderMeta()}
          {post.url && (
            <OpenLinkIcon
              size={IconSize.XSmall}
              className="text-text-quaternary transition-colors group-hover:text-text-tertiary"
            />
          )}
        </div>
      </div>
    </div>
  );

  if (post.url) {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-10 transition-colors hover:bg-surface-hover"
      >
        {content}
      </a>
    );
  }

  return content;
}

interface ExperienceTimelineProps {
  posts: ExperiencePost[];
  initiallyOpen?: boolean;
}

export function ExperienceTimeline({
  posts,
  initiallyOpen = false,
}: ExperienceTimelineProps): ReactElement {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [showAll, setShowAll] = useState(false);

  // Sort posts by date descending
  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [posts]);

  const visiblePosts = showAll ? sortedPosts : sortedPosts.slice(0, 4);
  const hiddenCount = sortedPosts.length - 4;
  const postCount = posts.length;

  return (
    <section className="mt-3 flex flex-col rounded-16 border border-border-subtlest-tertiary">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-hover"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <FlagIcon size={IconSize.Small} className="text-text-tertiary" />
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Highlights
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {postCount} {postCount === 1 ? 'highlight' : 'highlights'}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          {!isOpen && (
            <div className="hidden gap-1 tablet:flex">
              {sortedPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className={classNames(
                    'h-1.5 w-1.5 rounded-full',
                    TYPE_COLORS[post.type],
                  )}
                />
              ))}
            </div>
          )}
          <ArrowIcon
            size={IconSize.XSmall}
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
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-border-subtlest-tertiary p-4">
          {/* Timeline */}
          <div className="flex flex-col">
            {visiblePosts.map((post, index) => (
              <TimelineNode
                key={post.id}
                post={post}
                isLast={index === visiblePosts.length - 1}
              />
            ))}
          </div>

          {/* Show more/less */}
          {hiddenCount > 0 && !showAll && (
            <button
              type="button"
              className="ml-9 mt-2 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 transition-colors hover:bg-surface-hover"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
            >
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Link}
              >
                +{hiddenCount} more
              </Typography>
            </button>
          )}
          {showAll && sortedPosts.length > 4 && (
            <button
              type="button"
              className="ml-9 mt-2 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 transition-colors hover:bg-surface-hover"
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
    </section>
  );
}
