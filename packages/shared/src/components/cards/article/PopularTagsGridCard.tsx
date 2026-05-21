import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useCustomFeed } from '../../../hooks/feed/useCustomFeed';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { usePopularTagsWrapFit } from '../../../hooks/usePopularTagsWrapFit';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { getTagPageLink } from '../../../lib/links';
import { Origin } from '../../../lib/log';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';

export interface PopularTagItem {
  name: string;
  slug: string;
}

/**
 * Mirrors the curated `Popular tags` strip on the explore page. Static for
 * now — kept inline because no per-tag API call is required.
 */
export const POPULAR_TAGS: PopularTagItem[] = [
  { name: 'AI', slug: 'ai' },
  { name: 'Webdev', slug: 'webdev' },
  { name: 'Backend', slug: 'backend' },
  { name: 'Databases', slug: 'databases' },
  { name: 'Career', slug: 'career' },
  { name: 'Golang', slug: 'golang' },
  { name: 'Rust', slug: 'rust' },
  { name: 'Open source', slug: 'open-source' },
  { name: 'Testing', slug: 'testing' },
  { name: 'PHP', slug: 'php' },
  { name: 'Java', slug: 'java' },
  { name: 'Python', slug: 'python' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Security', slug: 'security' },
  { name: 'Cloud', slug: 'cloud' },
  { name: 'Kubernetes', slug: 'kubernetes' },
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'React', slug: 'react' },
  { name: 'Vue', slug: 'vue' },
  { name: 'Angular', slug: 'angular' },
  { name: 'Svelte', slug: 'svelte' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'Docker', slug: 'docker' },
  { name: 'AWS', slug: 'aws' },
  { name: 'GCP', slug: 'gcp' },
  { name: 'Azure', slug: 'azure' },
  { name: 'Linux', slug: 'linux' },
  { name: 'Git', slug: 'git' },
  { name: 'GraphQL', slug: 'graphql' },
  { name: 'Postgres', slug: 'postgres' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'Redis', slug: 'redis' },
  { name: 'Microservices', slug: 'microservices' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Data Science', slug: 'data-science' },
  { name: 'Productivity', slug: 'productivity' },
  { name: 'Startup', slug: 'startup' },
  { name: 'Tutorial', slug: 'tutorial' },
];

interface PopularTagsGridCardProps extends PostCardProps {
  tags?: PopularTagItem[];
}

const popularTagChipBaseClass =
  'focus-visible-outline inline-flex shrink-0 items-center gap-2 rounded-12 border border-border-subtlest-tertiary transition-colors';

const PopularTagChip = ({
  tag,
  rank,
  isFollowed,
  onFollowTag,
}: {
  tag: PopularTagItem;
  rank: number;
  isFollowed: boolean;
  onFollowTag: (keyword: string) => void;
}): ReactElement => {
  const keyword = tag.slug;

  if (isFollowed) {
    return (
      <li>
        <Link href={getTagPageLink(keyword)} passHref prefetch={false}>
          <a
            aria-label={tag.name}
            className={classNames(
              popularTagChipBaseClass,
              'bg-transparent px-3 py-1.5',
            )}
            title={`Check all #${keyword} posts`}
          >
            <span className="font-bold text-text-tertiary typo-caption2">
              #{rank}
            </span>
            <span className="font-bold text-text-primary typo-callout">
              {tag.name}
            </span>
          </a>
        </Link>
      </li>
    );
  }

  return (
    <li
      className={classNames(
        popularTagChipBaseClass,
        'bg-surface-float hover:bg-surface-hover',
      )}
    >
      <Link href={getTagPageLink(keyword)} passHref prefetch={false}>
        <a
          className="inline-flex items-center gap-2 px-3 py-1.5"
          title={`Check all #${keyword} posts`}
        >
          <span className="font-bold text-text-tertiary typo-caption2">
            #{rank}
          </span>
          <span className="font-bold text-text-primary typo-callout">
            {tag.name}
          </span>
        </a>
      </Link>
      <span
        className="h-3 translate-y-px rounded-2 border border-border-subtlest-tertiary"
        role="separator"
      />
      <Tooltip content={`Follow #${keyword}`}>
        <Button
          className="mr-1 shrink-0"
          icon={<PlusIcon aria-hidden size={IconSize.XSmall} />}
          onClick={() => onFollowTag(keyword)}
          size={ButtonSize.XSmall}
          type="button"
        />
      </Tooltip>
    </li>
  );
};

export const PopularTagsGridCard = forwardRef(function PopularTagsGridCard(
  {
    post,
    domProps = {},
    children,
    tags = POPULAR_TAGS,
  }: PopularTagsGridCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { isLoggedIn } = useAuthContext();
  const { feedId, isCustomFeed } = useCustomFeed();
  const { feedSettings } = useFeedSettings({
    feedId: isCustomFeed ? feedId : undefined,
  });
  const { onFollowTags } = useTagAndSource({
    origin: Origin.PostTags,
    feedId,
    shouldInvalidateQueries: false,
  });

  const followedTagSet = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );

  const onFollowTag = useCallback(
    (keyword: string) => {
      onFollowTags({
        tags: [keyword],
        requireLogin: true,
      });
    },
    [onFollowTags],
  );

  const { listRef, visibleTags } = usePopularTagsWrapFit(tags);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        // No `CardOverlay`: each chip is its own link; avoid a full-card anchor
        // shadowing chip clicks.
        className: classNames(
          className,
          'h-full overflow-hidden !border-0 !bg-surface-float !p-0',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt, trending: post.trending }}
      bookmarked={post.bookmarked}
    >
      <div className="absolute inset-0 flex flex-col p-3 laptop:p-4">
        <header className="mb-3">
          <h2 className="font-bold text-text-primary typo-title3">
            Popular tags
          </h2>
        </header>
        <ul
          ref={listRef as React.Ref<HTMLUListElement>}
          aria-label="Popular tags"
          className="flex min-h-0 flex-1 list-none flex-wrap content-start gap-2 overflow-hidden p-0"
        >
          {visibleTags.map((tag, index) => (
            <PopularTagChip
              isFollowed={isLoggedIn && followedTagSet.has(tag.slug)}
              key={tag.slug}
              onFollowTag={onFollowTag}
              rank={index + 1}
              tag={tag}
            />
          ))}
        </ul>
        {children}
      </div>
    </FeedItemContainer>
  );
});
