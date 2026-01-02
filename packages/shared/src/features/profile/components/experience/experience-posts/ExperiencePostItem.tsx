import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../../components/typography/Typography';
import {
  FlagIcon,
  LinkIcon,
  TerminalIcon,
  PlayIcon,
  StarIcon,
  GitHubIcon,
  OpenLinkIcon,
} from '../../../../../components/icons';
import { IconSize } from '../../../../../components/Icon';
import { Pill, PillSize } from '../../../../../components/Pill';
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
  [ExperiencePostType.Milestone]:
    'bg-accent-onion-subtler text-accent-onion-default',
  [ExperiencePostType.Publication]:
    'bg-accent-water-subtler text-accent-water-default',
  [ExperiencePostType.Project]:
    'bg-accent-cabbage-subtler text-accent-cabbage-default',
  [ExperiencePostType.Media]:
    'bg-accent-cheese-subtler text-accent-cheese-default',
  [ExperiencePostType.Achievement]:
    'bg-accent-bun-subtler text-accent-bun-default',
  [ExperiencePostType.OpenSource]:
    'bg-accent-blueCheese-subtler text-accent-blueCheese-default',
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

interface ExperiencePostItemProps {
  post: ExperiencePost;
}

export function ExperiencePostItem({
  post,
}: ExperiencePostItemProps): ReactElement {
  const Icon = TYPE_ICONS[post.type];
  const colorClass = TYPE_COLORS[post.type];
  const label = TYPE_LABELS[post.type];

  const renderMeta = (): ReactElement | null => {
    switch (post.type) {
      case ExperiencePostType.Publication: {
        const pub = post as PublicationPost;
        return (
          <div className="flex items-center gap-2">
            {pub.publisher && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {pub.publisher}
              </Typography>
            )}
            {pub.readTime && (
              <>
                <span className="text-text-quaternary">·</span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {pub.readTime} min read
                </Typography>
              </>
            )}
          </div>
        );
      }
      case ExperiencePostType.Project: {
        const proj = post as ProjectPost;
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {proj.technologies?.slice(0, 4).map((tech) => (
              <Pill
                key={tech}
                label={tech}
                size={PillSize.Small}
                className="border border-border-subtlest-tertiary text-text-quaternary"
              />
            ))}
            {proj.status && (
              <Pill
                label={
                  proj.status === 'in-progress' ? 'In Progress' : proj.status
                }
                size={PillSize.Small}
                className={classNames(
                  proj.status === 'completed' &&
                    'bg-accent-onion-subtler text-accent-onion-default',
                  proj.status === 'launched' &&
                    'bg-accent-cabbage-subtler text-accent-cabbage-default',
                  proj.status === 'in-progress' &&
                    'bg-accent-cheese-subtler text-accent-cheese-default',
                )}
              />
            )}
          </div>
        );
      }
      case ExperiencePostType.Media: {
        const media = post as MediaPost;
        return (
          <div className="flex items-center gap-2">
            {media.venue && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {media.venue}
              </Typography>
            )}
            {media.duration && (
              <>
                <span className="text-text-quaternary">·</span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {media.duration} min
                </Typography>
              </>
            )}
          </div>
        );
      }
      case ExperiencePostType.Achievement: {
        const achievement = post as AchievementPost;
        return (
          <div className="flex items-center gap-2">
            {achievement.issuer && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {achievement.issuer}
              </Typography>
            )}
            {achievement.credentialId && (
              <>
                <span className="text-text-quaternary">·</span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  ID: {achievement.credentialId}
                </Typography>
              </>
            )}
          </div>
        );
      }
      case ExperiencePostType.OpenSource: {
        const oss = post as OpenSourcePost;
        return (
          <div className="flex items-center gap-3">
            {oss.stars !== undefined && (
              <div className="flex items-center gap-1">
                <StarIcon
                  size={IconSize.XSmall}
                  className="text-accent-cheese-default"
                />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {oss.stars.toLocaleString()}
                </Typography>
              </div>
            )}
            {oss.contributions !== undefined && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {oss.contributions} contributions
              </Typography>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const content = (
    <div className="flex gap-3">
      {/* Thumbnail or icon */}
      {post.image ? (
        <Image
          className="h-16 w-16 flex-shrink-0 rounded-12 object-cover"
          type={ImageType.Post}
          src={post.image}
          alt={post.title}
        />
      ) : (
        <div
          className={classNames(
            'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-12',
            colorClass,
          )}
        >
          <Icon size={IconSize.Large} />
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Pill
                label={label}
                size={PillSize.Small}
                className={colorClass}
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                {formatDate(post.date)}
              </Typography>
            </div>
            <Typography
              type={TypographyType.Callout}
              bold
              className="line-clamp-1"
            >
              {post.title}
            </Typography>
          </div>
          {post.url && (
            <OpenLinkIcon
              size={IconSize.Small}
              className="flex-shrink-0 text-text-tertiary"
            />
          )}
        </div>

        {post.description && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
            className="line-clamp-2"
          >
            {post.description}
          </Typography>
        )}

        {renderMeta()}
      </div>
    </div>
  );

  if (post.url) {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-12 p-3 transition-colors hover:bg-surface-hover"
      >
        {content}
      </a>
    );
  }

  return <div className="rounded-12 p-3">{content}</div>;
}
