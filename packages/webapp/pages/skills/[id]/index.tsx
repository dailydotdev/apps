import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import {
  ArrowIcon,
  DiscussIcon,
  DownloadIcon,
  GitHubIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
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
  const now = new Date('2026-02-10T00:00:00Z');
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w`;
  }
  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}mo`;
  }
  return `${Math.floor(diffDays / 365)}y`;
};

interface CommentItemProps {
  comment: SkillComment;
}

const CommentItem = ({ comment }: CommentItemProps): ReactElement => (
  <article className="relative flex flex-col rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover">
    <div className="flex items-center gap-3">
      <div className="relative">
        <LazyImage
          className="h-10 w-10 rounded-full"
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
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            bold
          >
            {comment.author.name}
          </Typography>
          {comment.author.isAgent && (
            <span className="rounded-6 bg-accent-bun-subtlest px-1.5 py-0.5 text-accent-bun-default typo-caption2">
              Agent
            </span>
          )}
        </div>
        <span className="text-text-quaternary typo-footnote">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>
    </div>
    <div className="mt-3">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        className="text-text-primary"
      >
        {comment.content}
      </Typography>
    </div>
    <div className="mt-3 flex items-center gap-4">
      <button
        type="button"
        className="flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-accent-avocado-default"
      >
        <UpvoteIcon size={IconSize.Small} />
        <span className="typo-callout">{comment.upvotes}</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-accent-cabbage-default"
      >
        <DiscussIcon size={IconSize.Small} />
        <span className="typo-callout">Reply</span>
      </button>
    </div>
  </article>
);

const SkillDetailPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  const skill = getSkillById(id as string);
  const comments = getSkillComments(id as string);

  if (!skill) {
    return (
      <div className="m-auto flex min-h-page w-full flex-col items-center justify-center gap-4 px-4 py-16">
        <Typography tag={TypographyTag.H1} type={TypographyType.Title1}>
          Skill not found
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          onClick={() => router.push('/skills')}
        >
          Back to Skill Hub
        </Button>
      </div>
    );
  }

  const categoryColor = getCategoryColor(skill.category);

  return (
    <div className="m-auto flex w-full max-w-[69.25rem] flex-col pb-6 laptop:flex-row laptop:pb-0">
      {/* Main content */}
      <main className="flex flex-1 flex-col border-border-subtlest-tertiary px-4 pb-6 laptop:border-x laptop:px-8 laptop:pb-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => router.push('/skills')}
          className="my-4 flex w-fit items-center gap-2 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowIcon className="-rotate-90" size={IconSize.Small} />
          <span className="typo-callout">Back to Skill Hub</span>
        </button>

        {/* Skill source info (like PostSourceInfo) */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative">
            <LazyImage
              className="h-8 w-8 rounded-full"
              imgAlt={skill.author.name}
              imgSrc={skill.author.image}
              fallbackSrc={fallbackImages.avatar}
            />
            {skill.author.isAgent && (
              <span className="shadow-1 absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-bun-default text-[7px] text-white">
                🤖
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
            >
              {skill.author.name}
            </Typography>
            <span className="h-1 w-1 rounded-full bg-text-quaternary" />
            <span className="text-text-quaternary typo-footnote">
              {formatRelativeTime(skill.createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 break-words font-bold typo-large-title">
          {skill.displayName}
        </h1>

        {/* Tags (like PostTagList) */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={classNames(
              'rounded-10 border px-2 py-1 typo-footnote',
              categoryColor.bg,
              categoryColor.text,
              categoryColor.border,
            )}
          >
            {skill.category}
          </span>
          {skill.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-10 bg-surface-float px-3 py-1 text-text-tertiary transition-colors typo-footnote hover:bg-surface-hover hover:text-text-primary"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Metadata (like PostMetadata) */}
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-text-quaternary typo-callout">
          <span>{largeNumberFormat(skill.installs)} installs</span>
          <span className="h-1 w-1 rounded-full bg-text-quaternary" />
          <span>v{skill.version || '1.0.0'}</span>
          <span className="h-1 w-1 rounded-full bg-text-quaternary" />
          <span>{skill.license || 'MIT'}</span>
          {skill.repoUrl && (
            <>
              <span className="h-1 w-1 rounded-full bg-text-quaternary" />
              <a
                href={skill.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-text-primary hover:underline"
              >
                <GitHubIcon size={IconSize.XSmall} />
                Source
              </a>
            </>
          )}
        </div>

        {/* Description content */}
        <div className="mb-8">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            className="mb-4 text-text-secondary"
          >
            {skill.description}
          </Typography>
          {skill.longDescription && (
            <div className="prose prose-invert max-w-none">
              <Markdown content={skill.longDescription} />
            </div>
          )}
        </div>

        {/* Action buttons (like post actions) */}
        <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-border-subtlest-tertiary py-4">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="flex items-center gap-2"
          >
            <UpvoteIcon size={IconSize.Small} />
            <span>{largeNumberFormat(skill.upvotes)}</span>
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="flex items-center gap-2"
          >
            <DiscussIcon size={IconSize.Small} />
            <span>{largeNumberFormat(skill.comments)}</span>
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="ml-auto flex items-center gap-2"
          >
            <DownloadIcon size={IconSize.Small} />
            Install
          </Button>
        </div>

        {/* Comments section (like PostComments) */}
        <section>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            className="mb-4"
          >
            Comments ({comments.length})
          </Typography>

          {comments.length > 0 ? (
            <div className="-mx-4 flex flex-col gap-4 mobileL:mx-0">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="mb-12 mt-8 text-center text-text-quaternary typo-subhead">
              Be the first to comment.
            </div>
          )}
        </section>
      </main>

      {/* Sidebar (like PostWidgets) */}
      <PageWidgets className="px-4 laptop:px-6">
        {/* Author card */}
        <div className="flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
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
                  'typo-footnote',
                  skill.author.isAgent
                    ? 'text-accent-bun-default'
                    : 'text-text-quaternary',
                )}
              >
                {skill.author.isAgent ? 'AI Agent Creator' : 'Human Creator'}
              </span>
            </div>
          </div>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="w-full justify-center"
          >
            View profile
          </Button>
        </div>

        {/* Install card */}
        <div className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
            Install this skill
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full justify-center"
          >
            <DownloadIcon size={IconSize.Small} className="mr-2" />
            Install Skill
          </Button>
          {skill.repoUrl && (
            <a
              href={skill.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-2 text-text-secondary transition-colors typo-callout hover:bg-surface-hover hover:text-text-primary"
            >
              <GitHubIcon size={IconSize.Small} />
              View source
            </a>
          )}
        </div>

        {/* Info card */}
        <div className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
            Information
          </Typography>
          <div className="flex flex-col gap-2 text-text-tertiary typo-footnote">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-text-primary">
                {skill.version || '1.0.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>License</span>
              <span className="text-text-primary">
                {skill.license || 'MIT'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span className="text-text-primary">
                {formatDate(skill.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span className="text-text-primary">
                {formatDate(skill.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </PageWidgets>
    </div>
  );
};

const getSkillsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SkillDetailPage.getLayout = getSkillsPageLayout;
SkillDetailPage.layoutProps = {
  screenCentered: false,
};

export default SkillDetailPage;
