import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import {
  UpvoteIcon,
  DownloadIcon,
  DiscussIcon,
  ArrowIcon,
  GitHubIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import {
  getSkillById,
  getSkillComments,
} from '@dailydotdev/shared/src/features/skillHub/mocks';
import type { SkillComment } from '@dailydotdev/shared/src/features/skillHub/types';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';

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

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date('2026-02-10T00:00:00Z'); // Mock current date
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }
  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
  return `${Math.floor(diffDays / 365)} years ago`;
};

interface CommentCardProps {
  comment: SkillComment;
}

const CommentCard = ({ comment }: CommentCardProps): ReactElement => (
  <div className="flex gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div className="relative flex-shrink-0">
      <LazyImage
        className="h-10 w-10 rounded-12"
        imgAlt={comment.author.name}
        imgSrc={comment.author.image}
        fallbackSrc={fallbackImages.avatar}
      />
      {comment.author.isAgent && (
        <span className="shadow-1 absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-bun-default text-[8px] text-white">
          🤖
        </span>
      )}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <Typography tag={TypographyTag.Span} type={TypographyType.Callout} bold>
          {comment.author.name}
        </Typography>
        <span className="text-text-quaternary typo-caption1">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        className="text-text-secondary"
      >
        {comment.content}
      </Typography>
      <div className="flex items-center gap-1 text-text-tertiary">
        <UpvoteIcon size={IconSize.Size16} />
        <span className="typo-caption1">{comment.upvotes}</span>
      </div>
    </div>
  </div>
);

const SkillDetailPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  const skill = getSkillById(id as string);
  const comments = getSkillComments(id as string);

  if (!skill) {
    return (
      <PageWrapperLayout className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <Typography tag={TypographyTag.H1} type={TypographyType.Title1}>
          Skill not found
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          onClick={() => router.push('/skills')}
        >
          Back to Skill Hub
        </Button>
      </PageWrapperLayout>
    );
  }

  const categoryColor = getCategoryColor(skill.category);

  return (
    <PageWrapperLayout className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push('/skills')}
        className="flex w-fit items-center gap-2 text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowIcon className="-rotate-90" size={IconSize.Size16} />
        <span className="typo-callout">Back to Skill Hub</span>
      </button>

      <div className="flex flex-col gap-6 laptop:flex-row laptop:gap-8">
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
            <div className="flex flex-wrap items-center gap-2">
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
              {skill.version && (
                <span className="rounded-10 bg-surface-secondary px-2 py-1 text-text-tertiary typo-caption2">
                  v{skill.version}
                </span>
              )}
            </div>

            <Typography tag={TypographyTag.H1} type={TypographyType.LargeTitle}>
              {skill.displayName}
            </Typography>

            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Body}
              className="text-text-secondary"
            >
              {skill.description}
            </Typography>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <LazyImage
                  className="h-12 w-12 rounded-14"
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

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 border-t border-border-subtlest-tertiary pt-4">
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

          {/* Long description */}
          {skill.longDescription && (
            <div className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title3}
                bold
              >
                About
              </Typography>
              <div className="prose prose-invert max-w-none">
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  className="whitespace-pre-wrap text-text-secondary"
                >
                  {skill.longDescription}
                </Typography>
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Typography tag={TypographyTag.H2} type={TypographyType.Title3}>
                Comments ({comments.length})
              </Typography>
              <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
                Add comment
              </Button>
            </div>

            {comments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-8">
                <DiscussIcon
                  size={IconSize.XLarge}
                  className="text-text-quaternary"
                />
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  className="text-text-tertiary"
                >
                  No comments yet. Be the first to share your thoughts!
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-4 laptop:w-80">
          {/* Install card */}
          <div className="flex flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              className="w-full justify-center"
            >
              <DownloadIcon size={IconSize.Size16} className="mr-2" />
              Install Skill
            </Button>

            {skill.repoUrl && (
              <a
                href={skill.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-primary px-4 py-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <GitHubIcon size={IconSize.Size16} />
                <span className="typo-callout">View on GitHub</span>
              </a>
            )}
          </div>

          {/* Info card */}
          <div className="flex flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Callout}
              bold
            >
              Information
            </Typography>

            <div className="flex flex-col gap-3">
              {skill.license && (
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary typo-footnote">
                    License
                  </span>
                  <span className="typo-footnote">{skill.license}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary typo-footnote">
                  Created
                </span>
                <span className="typo-footnote">
                  {formatDate(skill.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary typo-footnote">
                  Updated
                </span>
                <span className="typo-footnote">
                  {formatDate(skill.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Tags card */}
          <div className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
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
                  className="rounded-10 bg-surface-secondary px-3 py-1 text-text-secondary transition-colors typo-footnote hover:bg-surface-hover"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapperLayout>
  );
};

const getSkillsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SkillDetailPage.getLayout = getSkillsPageLayout;
SkillDetailPage.layoutProps = {
  screenCentered: false,
};

export default SkillDetailPage;
