import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SearchIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  DEFAULT_POST_ID,
  postById,
  posts,
} from '../experiments/postPageFeed/data';
import { SeedComments, SettlePending } from '../experiments/postPageFeed/api';
import { useDeviceUrl } from '../history/device';
import type { Version } from './kit';
import { ExploreStrip, V1ExploreTabs } from './chrome';

// The pages the review puts inside each shell. The page is the same in
// every version — only the chrome around it changes — so each one is drawn
// once from production's own atoms: the feed from the real grid cards and
// the History review's posts, the post page from PostContent itself, the
// directories from their header strips and a sketch of their lists.

const noop = (): void => undefined;

/** Reports the page's URL to the device frame's address row. */
const AtUrl = ({ url }: { url: string }): null => {
  const setUrl = useDeviceUrl();
  React.useEffect(() => setUrl(url), [setUrl, url]);
  return null;
};

/* ------------------------------------------------------------- explore */

/** Production's grid card for the post's type, inert. */
const GridCard = ({ post }: { post: Post }): ReactElement => {
  const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;
  return (
    <Card
      post={post}
      onPostClick={noop}
      onCommentClick={noop}
      onPostAuxClick={noop}
      onReadArticleClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onBookmarkClick={noop}
      onCopyLinkClick={noop}
      onShare={noop}
      onMenuClick={noop}
    />
  );
};

const feedPosts = posts.filter((post) => post.image).slice(0, 12);

/**
 * /posts (Explore · Popular): the sort strip, then the grid. On v1 the sort
 * tabs were FeedExploreHeader's underlined tabs inside the page; since v2
 * they are the page strip's pills (FeedExploreTabs), for everyone on laptop.
 */
export const ExplorePage = ({
  version,
  count = 9,
  tight = false,
}: {
  version: Version;
  count?: number;
  /** A member's grid feed: FeedPage already drops the 40px inside the card. */
  tight?: boolean;
}): ReactElement => (
  <>
    <AtUrl url="/posts" />
    {version === 'before' ? <V1ExploreTabs /> : <ExploreStrip />}
    <div
      className={classNames(
        'grid w-full gap-8 px-6 pb-10',
        // The page container's 40px top padding (tablet:pt-10) plus the grid
        // wrapper's 24px: production today. The proposed fix drops the 40px
        // inside the card (FeedPageLayoutList, laptop:[.layout-frame_&]:pt-0).
        version === 'proposed' || tight ? 'pt-6' : 'pt-16',
        version === 'before' && 'mx-auto max-w-[69.25rem]',
      )}
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gridAutoRows: '23rem',
      }}
    >
      {feedPosts.slice(0, count).map((post) => (
        <GridCard key={post.id} post={post} />
      ))}
    </div>
  </>
);

/* ---------------------------------------------------------------- post */

/** pages/posts/[id]'s containerClass. */
const containerClass = '!mt-0 mb-0 max-w-[69.25rem] laptop:pb-6 laptopL:pb-0';

/** /posts/[id]: the real PostContent for a History-review post. */
export const PostPage = ({
  postId = DEFAULT_POST_ID,
}: {
  postId?: string;
}): ReactElement => {
  const post = (postById(postId) ?? postById(DEFAULT_POST_ID)) as Post;
  return (
    <>
      <AtUrl url={`/posts/${post.slug ?? post.id}`} />
      <SeedComments />
      <SettlePending />
      <ActivePostContextProvider post={post}>
        <PostContent
          post={post}
          isPostPage
          origin={Origin.ArticlePage}
          className={{
            container: containerClass,
            fixedNavigation: { container: 'flex laptop:hidden' },
            navigation: {
              container: 'flex tablet:hidden',
              actions: 'flex-1 justify-between',
            },
          }}
        />
      </ActivePostContextProvider>
    </>
  );
};

/* ---------------------------------------------------------------- tags */

const tagSections: { title: string; tags: string[] }[] = [
  {
    title: 'AI & Machine learning',
    tags: [
      'ai',
      'machine-learning',
      'llm',
      'openai',
      'prompt-engineering',
      'rag',
    ],
  },
  {
    title: 'Web development',
    tags: ['webdev', 'react', 'nextjs', 'typescript', 'css', 'tailwind-css'],
  },
  {
    title: 'DevOps & Cloud',
    tags: ['devops', 'kubernetes', 'docker', 'aws', 'terraform', 'ci-cd'],
  },
  {
    title: 'Languages',
    tags: ['rust', 'golang', 'python', 'java', 'kotlin', 'c++'],
  },
  {
    title: 'Data',
    tags: [
      'database',
      'postgresql',
      'sql',
      'data-engineering',
      'redis',
      'clickhouse',
    ],
  },
  {
    title: 'Career',
    tags: [
      'career',
      'productivity',
      'open-source',
      'leadership',
      'interviews',
      'remote-work',
    ],
  },
];

const TagChip = ({ tag }: { tag: string }): ReactElement => (
  <li className="flex items-center justify-between gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
    <span className="truncate typo-callout">#{tag}</span>
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Float}
    >
      Follow
    </Button>
  </li>
);

/**
 * /tags: a page with no strip at all — a hero, the letter filter, then the
 * sections. The one laptop page where nothing but the chrome says which app
 * this is, so the shell has to.
 */
export const TagsPage = (): ReactElement => (
  <div className="mx-auto flex w-full max-w-screen-laptop flex-col items-center px-4 pb-10 pt-4 tablet:px-6 tablet:pt-10">
    <AtUrl url="/tags" />
    <header className="flex w-full max-w-screen-tablet flex-col gap-2 tablet:items-center tablet:gap-5 tablet:text-center">
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
        className="tablet:typo-large-title"
      >
        Explore tags
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-[34rem] tablet:typo-body"
      >
        Browse the tags millions of developers follow on daily.dev. Search, jump
        to any letter, and follow the ones that matter to you.
      </Typography>
      <div className="flex h-12 w-full items-center gap-3 rounded-12 bg-background-subtle px-3 text-text-tertiary">
        <SearchIcon size={IconSize.Medium} />
        <span className="typo-body">Search tags</span>
      </div>
    </header>
    <div className="mt-8 w-full">
      <ul className="flex flex-wrap gap-1">
        {['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => (
          <li key={letter}>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={
                letter === 'A' ? ButtonVariant.Float : ButtonVariant.Tertiary
              }
              pressed={letter === 'A'}
            >
              {letter}
            </Button>
          </li>
        ))}
      </ul>
      <div className="my-10 h-px w-full bg-border-subtlest-tertiary" />
      <div className="grid w-full grid-cols-1 gap-x-10 gap-y-8 tablet:grid-cols-2 laptop:grid-cols-3">
        {tagSections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="font-bold typo-title3">{section.title}</h2>
            <ul className="flex flex-col gap-2">
              {section.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </div>
);

/* --------------------------------------------------------------- squads */

const squadTabs = [
  'Discover',
  'Featured',
  'AI',
  'Web',
  'DevRel',
  'DevOps',
  'Mobile',
  'Games',
  'Fun',
  'Career',
];

const squads = [
  {
    name: 'daily.dev changelog',
    handle: 'daily_updates',
    members: 184_201,
    image: 1,
  },
  { name: 'AI Engineers', handle: 'ai-engineers', members: 42_890, image: 2 },
  { name: 'Frontend Masters', handle: 'frontend', members: 38_112, image: 3 },
  { name: 'Rustaceans', handle: 'rust', members: 21_740, image: 4 },
  { name: 'Platform & SRE', handle: 'sre', members: 19_380, image: 5 },
  { name: 'Indie hackers', handle: 'indie', members: 17_604, image: 6 },
  {
    name: 'Open source weekly',
    handle: 'oss-weekly',
    members: 15_210,
    image: 7,
  },
  { name: 'Mobile devs', handle: 'mobile', members: 12_907, image: 8 },
  { name: 'Game dev corner', handle: 'gamedev', members: 9_412, image: 9 },
];

const format = (value: number): string =>
  value >= 1000
    ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}K`
    : `${value}`;

/**
 * /squads/discover: SquadDirectoryLayout's own strip (search, the tabs,
 * New Squad — which asks a visitor to log in), then the directory's
 * Popular Squads list.
 */
export const SquadsPage = ({ version }: { version: Version }): ReactElement => (
  <>
    <AtUrl url="/squads/discover" />
    <header
      className={classNames(
        'hidden tablet:flex',
        version === 'before'
          ? 'items-center gap-1 border-b border-border-subtlest-tertiary px-2'
          : [pageHeaderClassName, 'gap-4 !py-0'],
      )}
    >
      <div className="shrink-0 py-2">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<SearchIcon />}
          aria-label="Search Squads"
        />
      </div>
      <nav
        aria-label="Squad directory navigation"
        className="relative flex min-w-0 flex-1 flex-row flex-nowrap gap-2"
      >
        <ul className="no-scrollbar relative flex flex-1 flex-row flex-nowrap gap-2 overflow-x-auto">
          {squadTabs.map((label, index) => {
            const isActive = index === 0;
            return (
              <li
                key={label}
                className={classNames(
                  'relative py-3',
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-1/2 after:border-b-2',
                  { 'after:hidden': !isActive },
                )}
              >
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  pressed={isActive}
                  variant={
                    isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                  className="capitalize"
                >
                  {label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="shrink-0 py-2">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          icon={<PlusIcon />}
          title="Asks a visitor to log in"
        >
          New Squad
        </Button>
      </div>
    </header>
    <div className="flex w-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title3">Popular Squads</h2>
        <p className="text-text-tertiary typo-callout">
          The Squads developers join most this month.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-x-10 gap-y-3 tablet:grid-cols-2 laptop:grid-cols-3">
        {squads.map((squad) => (
          <li
            key={squad.handle}
            className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3"
          >
            <img
              alt=""
              src={`https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/${squad.image}`}
              className="size-12 shrink-0 rounded-full object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold typo-callout">
                {squad.name}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                {format(squad.members)} members · @{squad.handle}
              </span>
            </div>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              className="min-w-16"
            >
              Join
            </Button>
          </li>
        ))}
      </ul>
    </div>
  </>
);
