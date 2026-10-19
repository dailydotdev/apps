import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BlockIcon,
  DiscussIcon,
  LinkIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import type { Post, Source } from '../data';
import { categories, publications, sourcesForCategory } from '../data';
import {
  FollowButton,
  SourceLogo,
  SourceMenu,
  formatCount,
  useSources,
} from '../kit';
import { SectionHeader, TileRail } from './rail';

// /sources/[source], reached from any row, tile or search result: the hero
// (logo, name, @handle, followers, Follow, copy link and ⋯), the
// description and topics, the latest posts, and sources like it, which
// open their own page in turn. Tablet and up, the page header carries Back
// and the "Sources ›" crumb; phones swap Explore's block for a row with
// the back square, the name and ⋯, as SourceShellPage does.

const SIMILAR_SIZE = 10;

/** The category sharing the most topics with the source, then its sources. */
export const similarSources = (source: Source): Source[] => {
  const best = categories
    .map((category) => ({
      category,
      overlap: category.tags.filter((tag) => source.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)[0];
  const pool = best?.overlap
    ? sourcesForCategory(best.category.slug)
    : [...publications].sort((a, b) => b.followers - a.followers);
  return pool.filter(({ id }) => id !== source.id).slice(0, SIMILAR_SIZE);
};

const postDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const PostCard = ({
  post,
  source,
}: {
  post: Post;
  source: Source;
}): ReactElement => {
  const { goTo } = useSources();
  return (
    <a
      href={`https://daily.dev/posts/${post.id}`}
      onClick={(event) => {
        event.preventDefault();
        goTo(`/posts/${post.id}`);
      }}
      className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-2 pb-3 hover:bg-surface-hover"
    >
      <Image
        src={post.image}
        alt=""
        className="aspect-video w-full rounded-12 bg-surface-float object-cover"
      />
      <span className="flex flex-col gap-1 px-2">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          bold
          className="line-clamp-3"
        >
          {post.title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
          truncate
        >
          {postDate(post.createdAt)}
          {post.readTime ? (
            <>
              <Separator />
              {post.readTime}m read
            </>
          ) : null}
        </Typography>
        <span className="flex items-center gap-3 text-text-tertiary typo-footnote">
          <span className="flex items-center gap-1 tabular-nums">
            <UpvoteIcon size={IconSize.XSmall} aria-hidden />
            {formatCount(post.upvotes)}
            <span className="sr-only">upvotes on {source.name}</span>
          </span>
          <span className="flex items-center gap-1 tabular-nums">
            <DiscussIcon size={IconSize.XSmall} aria-hidden />
            {formatCount(post.comments)}
          </span>
        </span>
      </span>
    </a>
  );
};

export const SourcePage = ({
  source,
  onBack,
}: {
  source: Source;
  /** Back to where the source was opened from: the hub or another source. */
  onBack: () => void;
}): ReactElement => {
  const { blocked, unblock, copyLink, goTo } = useSources();
  const isBlocked = blocked.has(source.id);
  const similar = similarSources(source);

  return (
    <div className="flex flex-col">
      {/* Phones: SourceShellPage's row in place of Explore's block. */}
      <header className="fixed inset-x-0 top-0 z-header flex h-[3.25rem] items-center gap-2 bg-background-default px-4 tablet:hidden">
        <ShellSquare aria-label="Back" onClick={onBack}>
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </ShellSquare>
        <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">
          {source.name}
        </h1>
        <SourceMenu source={source} />
      </header>
      <div aria-hidden className="h-[3.25rem] tablet:hidden" />

      {/* Tablet and up: Back and the crumb in the page header. */}
      <header
        className={classNames(
          pageHeaderClassName,
          'sticky top-0 z-3 !hidden gap-2 bg-background-default tablet:!flex',
        )}
      >
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          aria-label="Back"
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBack}
        />
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-1 items-center gap-1 typo-callout"
        >
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-text-tertiary hover:text-text-primary"
          >
            Sources
          </button>
          <span aria-hidden className="text-text-quaternary">
            ›
          </span>
          <strong aria-current="page" className="min-w-0 truncate">
            {source.name}
          </strong>
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-10 pt-4 tablet:px-6 laptop:pt-6">
        <section className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <SourceLogo
              source={source}
              className="size-16 rounded-full tablet:size-20"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Typography
                tag={TypographyTag.H1}
                type={TypographyType.Title2}
                bold
                className="break-words"
              >
                {source.name}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                @{source.handle}
                <Separator />
                {formatCount(source.followers)} followers
                <Separator />
                {formatCount(source.posts)} posts
              </Typography>
              <div className="mt-2 flex items-center gap-1">
                {!isBlocked && <FollowButton source={source} />}
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  icon={<LinkIcon />}
                  aria-label="Copy link"
                  className="!hidden tablet:!flex"
                  onClick={copyLink}
                />
                <span className="hidden tablet:block">
                  <SourceMenu source={source} />
                </span>
              </div>
            </div>
          </div>

          {isBlocked && (
            <div className="flex items-center gap-3 rounded-12 bg-surface-float px-4 py-3">
              <BlockIcon
                size={IconSize.Small}
                className="shrink-0 text-text-tertiary"
              />
              <span className="min-w-0 flex-1 text-text-secondary typo-callout">
                You blocked {source.name}. Its posts stay out of your feed.
              </span>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Float}
                className="shrink-0"
                onClick={() => unblock(source)}
              >
                Unblock
              </Button>
            </div>
          )}

          {source.description && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="max-w-[60ch]"
            >
              {source.description}
            </Typography>
          )}

          {source.tags.length > 0 && (
            <ul aria-label="Topics" className="flex flex-wrap gap-2">
              {source.tags.map((tag) => (
                <li key={tag}>
                  <a
                    href={`https://daily.dev/tags/${tag}`}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(`/tags/${tag}`);
                    }}
                    className="flex h-7 items-center rounded-8 border border-border-subtlest-tertiary px-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
                  >
                    #{tag}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col">
          <SectionHeader title={`Latest posts from ${source.name}`} />
          {source.latest.length ? (
            <div className="mt-1 grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
              {source.latest.map((post) => (
                <PostCard key={post.id} post={post} source={source} />
              ))}
            </div>
          ) : (
            <p className="rounded-12 bg-surface-float px-4 py-6 text-center text-text-tertiary typo-callout">
              No posts from {source.name} yet. New ones show up here and in the
              feeds of everyone who follows it.
            </p>
          )}
        </section>

        {similar.length > 0 && (
          <TileRail
            title="Similar sources"
            subtitle="More on the same topics"
            items={similar}
          />
        )}
      </div>
    </div>
  );
};
