import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { featureCardSaveOnHover } from '@dailydotdev/shared/src/lib/featureManagement';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import post, { sharePost } from '@dailydotdev/shared/__tests__/fixture/post';
import { pollPost } from '@dailydotdev/shared/__tests__/fixture/pollPost';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

/**
 * `card_save_on_hover`, control vs treatment, on the production cards with
 * the shared test fixtures. Treatment: grid cards show the bookmark in the
 * header on hover (between Read post and ⋯, saved or not) and
 * the bar keeps today's bar and order at 32px. List cards are not part of the
 * experiment and stay at control.
 */

const article: Post = {
  ...post,
  numUpvotes: 63,
  numComments: 8,
  analytics: { impressions: 197000 },
} as Post;
const video: Post = {
  ...article,
  id: 'story-video',
  type: PostType.VideoYouTube,
  title: 'Shipping a design system in a week',
} as Post;
const freeform: Post = {
  ...article,
  id: 'story-freeform',
  type: PostType.Freeform,
  title: 'What I learned rewriting our feed in a weekend',
  contentHtml: '<p>Notes from the rewrite.</p>',
} as Post;
const collection: Post = {
  ...article,
  id: 'story-collection',
  type: PostType.Collection,
  title: 'React Server Components, explained',
  collectionSources: [post.source],
  numCollectionSources: 3,
} as Post;

const saved: Post = {
  ...article,
  id: 'story-saved',
  title: 'A post you already saved',
  bookmarked: true,
} as Post;

const CARDS: { label: string; post: Post }[] = [
  { label: 'Article', post: article },
  { label: 'Saved article', post: saved },
  { label: 'Share', post: sharePost },
  { label: 'Post', post: freeform },
  { label: 'Video', post: video },
  { label: 'Poll', post: pollPost },
  { label: 'Collection', post: collection },
];

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

const Flag = ({ on, children }: { on: boolean; children: ReactNode }) => (
  <FeatureOverrides values={{ [featureCardSaveOnHover.id]: on }}>
    {children}
  </FeatureOverrides>
);

/** Shows the hover state without a pointer: the header actions appear. */
const forceHoverCss = `
@media (pointer: fine) {
  .force-hover .laptop\\:mouse\\:group-hover\\:visible { visibility: visible; }
}`;

const Column = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">{title}</p>
      {note && <p className="text-text-tertiary typo-caption1">{note}</p>}
    </div>
    {children}
  </div>
);

interface GridArgs {
  width: number;
}

const GridCards = ({ width }: GridArgs): ReactElement => (
  <div className="min-h-screen bg-background-default p-8">
    <style>{forceHoverCss}</style>
    <div className="flex flex-col gap-10">
      {CARDS.map(({ label, post }) => {
        const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;
        return (
          <section key={label}>
            <h2 className="mb-3 font-bold text-text-primary typo-title3">
              {label}
            </h2>
            <div className="flex flex-wrap items-start gap-8">
              <Column title="Control" note="Today">
                <Flag on={false}>
                  <div style={{ width }}>
                    <Card post={post} {...handlers} />
                  </div>
                </Flag>
              </Column>
              <Column title="Treatment" note="At rest">
                <Flag on>
                  <div style={{ width }}>
                    <Card post={post} {...handlers} />
                  </div>
                </Flag>
              </Column>
              <Column title="Treatment" note="Hovered">
                <Flag on>
                  <div className="force-hover" style={{ width }}>
                    <Card post={post} {...handlers} />
                  </div>
                </Flag>
              </Column>
            </div>
          </section>
        );
      })}
    </div>
  </div>
);

interface ListArgs {
  show: 'both' | 'control' | 'treatment';
}

const ListCards = ({ show }: ListArgs): ReactElement => (
  <div className="min-h-screen bg-background-default p-4 tablet:p-8">
    <div className="flex flex-col gap-10 laptop:flex-row">
      {[false, true]
        .filter((on) => show === 'both' || (show === 'treatment') === on)
        .map((on) => (
          <Column
            key={String(on)}
            title={on ? 'Treatment' : 'Control'}
            note={on ? 'Bookmark stays in the bar' : 'Today'}
          >
            <Flag on={on}>
              <div className="flex w-full max-w-[40rem] flex-col">
                {CARDS.map(({ label, post }) => {
                  const Card = PostTypeToListCard[post.type] ?? ArticleList;
                  return <Card key={label} post={post} {...handlers} />;
                })}
              </div>
            </Flag>
          </Column>
        ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Experiments/Card save on hover',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

export const Grid: StoryObj<GridArgs> = {
  name: 'Grid cards',
  args: { width: 292 },
  argTypes: {
    width: { control: { type: 'range', min: 272, max: 420, step: 4 } },
  },
  render: (args) => <GridCards {...args} />,
};

export const List: StoryObj<ListArgs> = {
  name: 'List cards (phone and tablet)',
  args: { show: 'both' },
  argTypes: {
    show: {
      control: 'inline-radio',
      options: ['both', 'control', 'treatment'],
    },
  },
  render: (args) => <ListCards {...args} />,
};
