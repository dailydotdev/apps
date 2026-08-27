import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { CollectionGrid } from '@dailydotdev/shared/src/components/cards/collection/CollectionGrid';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';

import ExtensionProviders from '../../extension/_providers';

const source = {
  id: 'tds',
  handle: 'tds',
  name: 'Towards Data Science',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: SourceType.Machine,
  active: true,
  description: 'Your home for data science and AI.',
  membersCount: 132000,
  flags: { totalUpvotes: 48000 },
};

const collectionSources = [
  {
    id: 'react',
    handle: 'reactjs',
    name: 'React',
    permalink: 'https://app.daily.dev/sources/reactjs',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react',
    type: SourceType.Machine,
  },
  {
    id: 'nextjs',
    handle: 'nextjs',
    name: 'Next.js',
    permalink: 'https://app.daily.dev/sources/nextjs',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/nextjs',
    type: SourceType.Machine,
  },
  {
    id: 'ts',
    handle: 'typescript',
    name: 'TypeScript',
    permalink: 'https://app.daily.dev/sources/typescript',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ts',
    type: SourceType.Machine,
  },
];

const image =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/scvgbr5cbutrjhi1e8ao';

const tags = ['react', 'javascript', 'frontend'];

const base = {
  numUpvotes: 42,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  source,
  tags,
  readTime: 7,
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2026-07-16T09:00:00.000Z',
  permalink: 'https://api.daily.dev/r/post-1',
  commentsPermalink: 'https://daily.dev/posts/post-1',
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
};

const make = (overrides: Record<string, unknown>): Post =>
  ({ ...base, ...overrides } as unknown as Post);

// Titles chosen to wrap to 1, 2 and 3 lines at the ~320px grid card width.
const TITLES: { label: string; title: string }[] = [
  { label: '1-line title', title: 'The WASM revolution' },
  {
    label: '2-line title',
    title: 'The best React libraries we shipped this year',
  },
  {
    label: '3-line title',
    title:
      'Grok AI uploads entire git repository, including history and user directories',
  },
];

const collectionImage = (title: string, i: number): Post =>
  make({
    id: `coll-image-${i}`,
    type: PostType.Collection,
    title,
    image,
    collectionSources,
    numCollectionSources: 7,
  });

const collectionFreeform = (title: string, i: number): Post =>
  make({
    id: `coll-freeform-${i}`,
    type: PostType.Collection,
    title,
    contentHtml:
      '<p>A hand-picked round-up of what the community shipped this year, ' +
      'distilled into one place. Two competing philosophies about how teams ' +
      'build and ship are colliding, and the gap between them is getting ' +
      'harder to ignore for anyone paying attention.</p>',
    collectionSources,
    numCollectionSources: 10,
  });

const article = (title: string, i: number): Post =>
  make({ id: `article-${i}`, type: PostType.Article, title, image });

// A full author so the profile hover card (UserEntityCard) renders in
// Storybook — it needs id, username, name, image, permalink and createdAt.
const author = {
  id: 'author-1',
  name: 'John Developer',
  username: 'johndeveloper',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/scvgbr5cbutrjhi1e8ao',
  permalink: 'https://app.daily.dev/johndeveloper',
  bio: 'Full-stack developer who loves shipping fast and writing about it.',
  createdAt: '2022-03-10T10:00:00.000Z',
  reputation: 4200,
  isPlus: false,
};

// A regular freeform (share) post — NOT a collection. Rendered by the default
// FreeformGrid. The author (primary) sits in front on the left and the source
// (secondary) tucks in behind on the right. Uses the inline machine source so
// the source hover card renders in Storybook; real squad posts fetch theirs.
const freeform = (title: string, i: number): Post =>
  make({
    id: `freeform-${i}`,
    type: PostType.Freeform,
    author,
    title,
    contentHtml:
      '<p>A hand-picked round-up of what the community shipped this year, ' +
      'distilled into one place. Two competing philosophies about how teams ' +
      'build and ship are colliding, and the gap between them is getting ' +
      'harder to ignore for anyone paying attention.</p>',
  });

const handlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

const gridStyle = {
  maxWidth: 'calc(20rem * 4 + 2rem * 3)',
} as React.CSSProperties;

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement => (
  <>
    <p className="mb-3 mt-8 text-sm text-text-tertiary">{label}</p>
    <div className="grid grid-cols-4 items-stretch gap-8" style={gridStyle}>
      {children}
    </div>
  </>
);

const ColLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    className="mb-2 grid grid-cols-4 gap-8 text-xs font-bold uppercase tracking-wide text-text-quaternary"
    style={gridStyle}
  >
    {children}
  </div>
);

const CollectionTrendCardTags = (): React.ReactElement => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default p-8">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Collection / Trend card — alignment across all three cards
      </h2>
      <p className="mb-6 max-w-3xl text-sm text-text-tertiary">
        Each row shows the cards side by side with the{' '}
        <strong>same title</strong>, at 1, 2 and 3 lines: freeform collection,
        collection with image, the default article card, and a freeform post.
        Check that the tag chips and date strip line up across all of them, that
        the text preview sits a comfortable gap below the date, and hover the
        header avatars — author shows the profile card, source shows the source
        card.
      </p>
      <ColLabel>
        <span>Collection (freeform text)</span>
        <span>Collection (with image)</span>
        <span>Default article (image)</span>
        <span>Freeform post (not a collection)</span>
      </ColLabel>

      {TITLES.map((t, i) => (
        <Row key={t.label} label={t.label}>
          <CollectionGrid post={collectionFreeform(t.title, i)} {...handlers} />
          <CollectionGrid post={collectionImage(t.title, i)} {...handlers} />
          <ArticleGrid post={article(t.title, i)} eagerLoadImage {...handlers} />
          <FreeformGrid
            post={freeform(t.title, i)}
            enableSourceHeader
            {...handlers}
          />
        </Row>
      ))}
    </div>
  </ExtensionProviders>
);

const meta: Meta = {
  title: 'Components/Cards/Collection Trend Card Tags',
  component: CollectionTrendCardTags,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const TagPlacement: Story = {
  render: () => <CollectionTrendCardTags />,
  name: 'Alignment matrix',
};
