import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { ButtonProps } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Pill, PillSize } from '@dailydotdev/shared/src/components/Pill';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import {
  Tab,
  TabContainer,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import {
  HashtagIcon,
  OpenLinkIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { GET_RECOMMENDED_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import type { TopPost } from '@dailydotdev/shared/src/graphql/feed';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { cloudinarySourceRoadmap } from '@dailydotdev/shared/src/lib/image';

type TagStatus = 'followed' | 'blocked' | 'unfollowed';

export type TagFaqItem = {
  question: string;
  answer: string;
};

const formatCompactNumber = (value?: number): string => {
  if (!value) {
    return '0';
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const uniqueTagNames = (tags: TagsData['tags'] = []): string[] =>
  Array.from(
    new Set(
      tags
        .map((relatedTag) => relatedTag.name)
        .filter((relatedTag): relatedTag is string => !!relatedTag),
    ),
  );

const joinNames = (names: string[]): string => {
  if (names.length === 0) {
    return '';
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

export const getTagFaqItems = ({
  tag,
  title,
  description,
  occurrences,
  recommendedTags,
  topContributors,
  topSources,
}: {
  tag: string;
  title: string;
  description?: string;
  occurrences?: number;
  recommendedTags?: TagsData['tags'];
  topContributors?: UserShortProfile[];
  topSources?: Source[];
}): TagFaqItem[] => {
  const relatedTagNames = uniqueTagNames(recommendedTags).slice(0, 6);
  const contributorNames = (topContributors ?? [])
    .map((contributor) => contributor.name)
    .filter(Boolean)
    .slice(0, 5);
  const sourceNames = (topSources ?? [])
    .map((source) => source.name)
    .filter(Boolean)
    .slice(0, 5);
  const intro =
    description ||
    `daily.dev collects developer posts, videos, updates, and discussions about ${title} in one place.`;

  return [
    {
      question: `What is ${title} on daily.dev?`,
      answer: intro,
    },
    {
      question: `How many ${title} posts are on daily.dev?`,
      answer: `daily.dev currently indexes ${formatCompactNumber(
        occurrences,
      )} posts and discussions related to ${title}.`,
    },
    ...(contributorNames.length
      ? [
          {
            question: `Who are the top ${title} contributors?`,
            answer: `Top contributors in this topic include ${joinNames(
              contributorNames,
            )}.`,
          },
        ]
      : []),
    ...(sourceNames.length
      ? [
          {
            question: `Which sources cover ${title}?`,
            answer: `Sources covering ${title} include ${joinNames(
              sourceNames,
            )}.`,
          },
        ]
      : []),
    ...(relatedTagNames.length
      ? [
          {
            question: `What topics are related to ${title}?`,
            answer: `Related topics include ${joinNames(relatedTagNames)}.`,
          },
        ]
      : []),
    {
      question: `How do I get a personalized ${title} feed?`,
      answer: `Follow the ${tag} tag on daily.dev to add it to your personalized developer feed and discover relevant posts from the community.`,
    },
  ];
};

const SectionShell = ({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    className={classNames(
      'shadow-1 mx-4 mb-8 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-6',
      className,
    )}
  >
    <div className="mb-5 flex flex-col gap-1">
      {eyebrow && (
        <p className="font-bold uppercase tracking-wide text-accent-cabbage-default typo-caption1">
          {eyebrow}
        </p>
      )}
      <h2 className="font-bold typo-title3">{title}</h2>
      {description && (
        <p className="max-w-2xl text-text-tertiary typo-callout">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const TagStat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}): ReactElement => (
  <div className="min-w-0 rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3">
    <p className={classNames('font-bold typo-title3', accent)}>{value}</p>
    <p className="mt-1 truncate text-text-tertiary typo-caption1">{label}</p>
  </div>
);

export const TagStatsBar = ({
  occurrences,
  contributorsCount,
  sourcesCount,
  relatedTagsCount,
}: {
  occurrences?: number;
  contributorsCount: number;
  sourcesCount: number;
  relatedTagsCount: number;
}): ReactElement => (
  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
    <TagStat
      label="indexed posts"
      value={formatCompactNumber(occurrences)}
      accent="text-accent-cabbage-default"
    />
    <TagStat
      label="top contributors"
      value={formatCompactNumber(contributorsCount)}
      accent="text-accent-onion-default"
    />
    <TagStat
      label="trusted sources"
      value={formatCompactNumber(sourcesCount)}
      accent="text-accent-water-default"
    />
    <TagStat
      label="related topics"
      value={formatCompactNumber(relatedTagsCount)}
      accent="text-accent-cheese-default"
    />
  </div>
);

export const TagHero = ({
  tag,
  title,
  description,
  occurrences,
  contributorsCount,
  sourcesCount,
  relatedTagsCount,
  tagStatus,
  isAnonymous,
  onPrimaryAction,
  actions,
  sponsoredHero,
  seoLinks,
}: {
  tag: string;
  title: string;
  description?: string;
  occurrences?: number;
  contributorsCount: number;
  sourcesCount: number;
  relatedTagsCount: number;
  tagStatus: TagStatus;
  isAnonymous: boolean;
  onPrimaryAction: ButtonProps<'button'>['onClick'];
  actions: ReactNode;
  sponsoredHero?: ReactNode;
  seoLinks?: ReactNode;
}): ReactElement => {
  let primaryLabel = 'Follow topic';
  if (tagStatus === 'followed') {
    primaryLabel = 'Unfollow topic';
  } else if (tagStatus === 'blocked') {
    primaryLabel = 'Unblock topic';
  } else if (isAnonymous) {
    primaryLabel = 'Follow & personalize my feed';
  }

  return (
    <section className="relative mx-4 mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 shadow-2 tablet:p-6">
      <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/15 pointer-events-none absolute -right-16 top-0 size-64 rounded-full blur-3xl" />
      <div className="bg-accent-water-default/10 pointer-events-none absolute bottom-0 left-1/2 size-48 rounded-full blur-3xl" />
      <div className="relative flex flex-col gap-6">
        {sponsoredHero}
        <div className="flex flex-col justify-between gap-4 laptop:flex-row laptop:items-start">
          <div className="min-w-0 max-w-3xl">
            <Pill
              size={PillSize.Small}
              label="Developer topic hub"
              className="mb-4 bg-accent-cabbage-subtlest text-accent-cabbage-default"
            />
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-18 bg-accent-cabbage-subtlest text-accent-cabbage-default">
                <HashtagIcon size={IconSize.Large} />
              </div>
              <h1 className="min-w-0 bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text font-bold text-transparent typo-title1 tablet:typo-mega3">
                {title}
              </h1>
            </div>
            {description && (
              <p className="mt-4 max-w-2xl text-text-tertiary typo-body">
                {description}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-text-secondary typo-callout">
              Start with the best {title} posts, follow the topic, and turn it
              into a personalized feed shaped by the daily.dev community.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 laptop:justify-end">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={tagStatus === 'followed' ? undefined : <PlusIcon />}
              onClick={onPrimaryAction}
              aria-label={primaryLabel}
            >
              {primaryLabel}
            </Button>
            {actions}
          </div>
        </div>
        <TagStatsBar
          occurrences={occurrences}
          contributorsCount={contributorsCount}
          sourcesCount={sourcesCount}
          relatedTagsCount={relatedTagsCount}
        />
        {isAnonymous && (
          <div className="border-accent-cabbage-default/30 rounded-16 border bg-accent-cabbage-subtlest p-4">
            <p className="font-bold typo-callout">
              One click turns #{tag} into your first daily.dev signal.
            </p>
            <p className="mt-1 text-text-tertiary typo-footnote">
              We will use this topic and its related tags to help your first
              feed feel relevant immediately after signup.
            </p>
          </div>
        )}
        {seoLinks}
      </div>
    </section>
  );
};

export const TagFeaturedPost = ({
  tagTitle,
  post,
}: {
  tagTitle: string;
  post?: TopPost;
}): ReactElement | null => {
  if (!post?.title) {
    return null;
  }

  return (
    <SectionShell
      eyebrow="Start here"
      title={`The fastest way into ${tagTitle}`}
      description="A highly-ranked community post gives new visitors an immediate taste of what this topic feed can unlock."
      className="bg-gradient-to-br from-surface-float to-accent-cabbage-subtlest"
    >
      <Link href={`/posts/${post.slug || post.id}`} passHref prefetch={false}>
        <a className="group relative block overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-surface-primary p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2">
          <div className="from-accent-cabbage-default/0 to-accent-onion-default/0 group-hover:opacity-10 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200" />
          <div className="relative flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
            <div className="min-w-0">
              <Pill
                size={PillSize.XSmall}
                label="Community favorite"
                className="mb-3 bg-accent-cheese-subtlest text-accent-cheese-default"
              />
              <h3 className="font-bold typo-title3">{post.title}</h3>
              <p className="mt-2 text-text-tertiary typo-callout">
                Read the post, then keep scrolling for more top discussions and
                fresh posts.
              </p>
            </div>
            <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-10 bg-surface-float px-3 font-semibold text-text-primary typo-footnote">
              Read post
              <OpenLinkIcon size={IconSize.XSmall} />
            </span>
          </div>
        </a>
      </Link>
    </SectionShell>
  );
};

type BestOfTab = 'Top posts' | 'Most upvoted' | 'Best discussed';

export const TagBestOfTabs = ({
  tagTitle,
  topPostsFeed,
  mostUpvotedFeed,
  bestDiscussedFeed,
}: {
  tagTitle: string;
  topPostsFeed: ReactNode;
  mostUpvotedFeed: ReactNode;
  bestDiscussedFeed: ReactNode;
}): ReactElement => (
  <SectionShell
    eyebrow="Best of"
    title={`What developers are reading about ${tagTitle}`}
    description="Scan the strongest entry points without wading through the full feed."
  >
    <TabContainer<BestOfTab>
      shouldMountInactive
      showBorder={false}
      className={{
        container: 'rounded-20 border border-border-subtlest-tertiary',
        header:
          'no-scrollbar overflow-x-auto rounded-t-20 bg-surface-primary px-2',
      }}
      tabListProps={{
        dragScroll: true,
        autoScrollActive: true,
        className: {
          item: 'whitespace-nowrap',
          indicator: 'bg-accent-cabbage-default',
        },
      }}
    >
      <Tab<BestOfTab> label="Top posts" className="pt-4">
        {topPostsFeed}
      </Tab>
      <Tab<BestOfTab> label="Most upvoted" className="pt-4">
        {mostUpvotedFeed}
      </Tab>
      <Tab<BestOfTab> label="Best discussed" className="pt-4">
        {bestDiscussedFeed}
      </Tab>
    </TabContainer>
  </SectionShell>
);

const EntityPlaceholder = (): ReactElement => (
  <div className="h-36 rounded-18 border border-border-subtlest-tertiary bg-surface-primary" />
);

const EntityCard = ({
  image,
  imageAlt,
  name,
  permalink,
  badge,
}: {
  image: string;
  imageAlt: string;
  name: string;
  permalink: string;
  badge?: string;
}): ReactElement => (
  <Link href={permalink} passHref prefetch={false}>
    <a className="group relative flex min-w-0 flex-col rounded-18 border border-border-subtlest-tertiary bg-surface-primary p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2">
      {badge && (
        <span className="absolute right-3 top-3 rounded-8 bg-accent-cheese-subtlest px-2 py-1 font-bold text-accent-cheese-default typo-caption2">
          {badge}
        </span>
      )}
      <img
        src={image}
        alt={imageAlt}
        className="mx-auto size-14 rounded-full object-cover"
      />
      <p className="mt-3 min-w-0 truncate font-bold typo-callout">{name}</p>
    </a>
  </Link>
);

const TagTopSourcesGrid = ({
  tag,
  initialSources = [],
}: {
  tag: string;
  initialSources?: Source[];
}): ReactElement | null => {
  const { data: topSources, isPending } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],
    queryFn: async () =>
      await gqlClient.request<{ sourcesByTag: Connection<Source> }>(
        SOURCES_BY_TAG_QUERY,
        {
          tag,
          first: 6,
        },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources =
    topSources?.sourcesByTag?.edges?.map((edge) => edge.node) ?? initialSources;

  if (isPending && initialSources.length === 0) {
    return <EntityPlaceholder />;
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 font-bold typo-callout">Trusted sources</p>
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {sources.map((source) => (
          <EntityCard
            key={source.id || source.permalink}
            image={source.image}
            imageAlt={`${source.name} logo`}
            name={source.name}
            permalink={source.permalink}
          />
        ))}
      </div>
    </div>
  );
};

const TagTopContributorsGrid = ({
  tag,
  initialUsers = [],
}: {
  tag: string;
  initialUsers?: UserShortProfile[];
}): ReactElement | null => {
  const { data: topContributors, isPending } = useQuery({
    queryKey: [RequestKey.TopCreatorsByTag, null, tag],
    queryFn: async () =>
      await gqlClient.request<{ topCreatorsByTag: UserShortProfile[] }>(
        TOP_CREATORS_BY_TAG_QUERY,
        {
          tag,
          limit: 6,
        },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const users = topContributors?.topCreatorsByTag ?? initialUsers;

  if (isPending && initialUsers.length === 0) {
    return <EntityPlaceholder />;
  }

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 font-bold typo-callout">Top contributors</p>
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {users.map((user, index) => (
          <EntityCard
            key={user.id}
            image={user.image}
            imageAlt={`${user.name} avatar`}
            name={user.name}
            permalink={user.permalink}
            badge={index < 3 ? `#${index + 1}` : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export const TagCommunity = ({
  tag,
  tagTitle,
  initialUsers,
  initialSources,
}: {
  tag: string;
  tagTitle: string;
  initialUsers?: UserShortProfile[];
  initialSources?: Source[];
}): ReactElement => (
  <SectionShell
    eyebrow="Community signal"
    title={`People and sources shaping ${tagTitle}`}
    description="Directories convert when visitors trust the curation. These are the creators and sources already producing signal for this topic."
  >
    <div className="grid gap-6 laptop:grid-cols-2">
      <TagTopContributorsGrid tag={tag} initialUsers={initialUsers} />
      <TagTopSourcesGrid tag={tag} initialSources={initialSources} />
    </div>
  </SectionShell>
);

export const TagUniverse = ({
  tag,
  tagTitle,
  blockedTags,
  initialTags = [],
}: {
  tag: string;
  tagTitle: string;
  blockedTags?: string[];
  initialTags?: TagsData['tags'];
}): ReactElement | null => {
  const { data: recommendedTags, isPending } = useQuery({
    queryKey: [RequestKey.RecommendedTags, null, tag],
    queryFn: async () =>
      await gqlClient.request<{
        recommendedTags: TagsData;
      }>(GET_RECOMMENDED_TAGS_QUERY, {
        tags: [tag],
        excludedTags: blockedTags || [],
      }),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const tags = recommendedTags?.recommendedTags?.tags ?? initialTags;
  const tagNames = uniqueTagNames(tags);

  if (isPending && initialTags.length === 0) {
    return (
      <SectionShell eyebrow="Explore nearby" title={`The ${tagTitle} universe`}>
        <div className="h-24 rounded-18 bg-surface-primary" />
      </SectionShell>
    );
  }

  if (tagNames.length === 0) {
    return null;
  }

  return (
    <SectionShell
      eyebrow="Explore nearby"
      title={`The ${tagTitle} universe`}
      description="Follow adjacent topics to make your feed sharper and help search engines understand the topical cluster."
      className="bg-gradient-to-br from-surface-float to-accent-onion-subtlest"
    >
      <div className="flex flex-wrap gap-2">
        {tagNames.map((relatedTag) => (
          <Link
            key={relatedTag}
            href={getTagPageLink(relatedTag)}
            passHref
            prefetch={false}
          >
            <a className="hover:shadow-1 group inline-flex h-10 items-center rounded-12 border border-border-subtlest-tertiary bg-surface-primary px-4 font-bold text-text-tertiary transition-all duration-200 typo-callout hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:text-text-primary">
              <HashtagIcon
                size={IconSize.XSmall}
                className="mr-1.5 text-accent-cabbage-default"
              />
              {relatedTag}
            </a>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
};

export const TagLearnSection = ({
  tag,
  tagTitle,
  roadmapUrl,
  archive,
}: {
  tag: string;
  tagTitle: string;
  roadmapUrl?: string;
  archive: ReactNode;
}): ReactElement => (
  <SectionShell
    eyebrow="Go deeper"
    title={`Learn and revisit the best of ${tagTitle}`}
    description="Keep evergreen learning paths and historical best-of archives close to the live feed."
  >
    <div className="grid gap-4 laptop:grid-cols-2">
      {roadmapUrl && (
        <Link href={roadmapUrl} passHref prefetch={false}>
          <a
            target="_blank"
            rel={anchorDefaultRel}
            className="group flex cursor-pointer items-center rounded-20 border border-border-subtlest-tertiary bg-surface-primary p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2"
          >
            <img
              src={cloudinarySourceRoadmap}
              alt="roadmap.sh logo"
              className="size-12 rounded-full"
            />
            <div className="mx-4 min-w-0 flex-1">
              <p className="font-bold typo-callout">
                Comprehensive roadmap for {tag}
              </p>
              <p className="text-text-tertiary typo-footnote">
                Structured learning path by roadmap.sh
              </p>
            </div>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-primary">
              <OpenLinkIcon size={IconSize.XSmall} />
            </span>
          </a>
        </Link>
      )}
      <div className={classNames(!roadmapUrl && 'laptop:col-span-2')}>
        {archive}
      </div>
    </div>
  </SectionShell>
);

export const TagFaq = ({
  tag,
  tagTitle,
  description,
  occurrences,
  recommendedTags,
  topContributors,
  topSources,
}: {
  tag: string;
  tagTitle: string;
  description?: string;
  occurrences?: number;
  recommendedTags?: TagsData['tags'];
  topContributors?: UserShortProfile[];
  topSources?: Source[];
}): ReactElement => {
  const items = getTagFaqItems({
    tag,
    title: tagTitle,
    description,
    occurrences,
    recommendedTags,
    topContributors,
    topSources,
  });

  return (
    <SectionShell
      eyebrow="About this topic"
      title={`Questions developers ask about ${tagTitle}`}
      description="Concise answers make the page more useful for humans and easier for search and AI systems to cite."
    >
      <div className="divide-y divide-border-subtlest-tertiary rounded-20 border border-border-subtlest-tertiary bg-surface-primary p-4">
        {items.map((item, index) => (
          <div key={item.question} className={classNames(index > 0 && 'pt-4')}>
            <Accordion
              title={<p className="font-bold typo-callout">{item.question}</p>}
              initiallyOpen={index === 0}
              className={{
                button: '!bg-transparent',
              }}
            >
              <p className="pb-4 text-text-tertiary typo-callout">
                {item.answer}
              </p>
            </Accordion>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

export const TagSignupCta = ({
  tagTitle,
  relatedTagsCount,
  onClick,
}: {
  tagTitle: string;
  relatedTagsCount: number;
  onClick: ButtonProps<'button'>['onClick'];
}): ReactElement => (
  <div className="border-accent-cabbage-default/30 sticky bottom-20 z-1 mx-4 mb-8 rounded-20 border bg-surface-float p-4 shadow-2 tablet:bottom-6">
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
      <div className="min-w-0">
        <p className="font-bold typo-callout">
          Build your developer feed around {tagTitle}
        </p>
        <p className="text-text-tertiary typo-footnote">
          Follow this topic
          {relatedTagsCount > 0
            ? ` plus ${relatedTagsCount} related signals`
            : ''}
          , then get relevant posts daily.
        </p>
      </div>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={onClick}
      >
        Personalize my feed
      </Button>
    </div>
  </div>
);
