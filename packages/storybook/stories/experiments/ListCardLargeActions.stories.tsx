import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { featureListCardLargeActions } from '@dailydotdev/shared/src/lib/featureManagement';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import post, { sharePost } from '@dailydotdev/shared/__tests__/fixture/post';
import { pollPost } from '@dailydotdev/shared/__tests__/fixture/pollPost';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

/**
 * `list_card_large_actions`, control vs treatment, on the production list
 * cards (the phone and tablet feed) with the shared test fixtures. Treatment:
 * the bar's buttons go from 24px to 32px and the icons from 16px to 20px, the
 * same size grid cards use. The bookmark stays in the bar, and the row grows
 * to fit, so each card is 8px taller.
 */

const article: Post = {
  ...post,
  numUpvotes: 63,
  numComments: 8,
  analytics: { impressions: 197000 },
} as Post;
const saved: Post = {
  ...article,
  id: 'story-saved',
  title: 'A post you already saved',
  bookmarked: true,
  upvoted: true,
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

const CARDS: { label: string; post: Post }[] = [
  { label: 'Article', post: article },
  { label: 'Saved and upvoted', post: saved },
  { label: 'Share', post: sharePost },
  { label: 'Post', post: freeform },
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

const Column = ({
  on,
  children,
}: {
  on: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">
        {on ? 'Treatment' : 'Control'}
      </p>
      <p className="text-text-tertiary typo-caption1">
        {on ? '32px buttons, 20px icons' : 'Today: 24px buttons, 16px icons'}
      </p>
    </div>
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: on }}>
      <div className="flex w-full max-w-[40rem] flex-col">{children}</div>
    </FeatureOverrides>
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
          <Column key={String(on)} on={on}>
            {CARDS.map(({ label, post: cardPost }) => {
              const Card = PostTypeToListCard[cardPost.type] ?? ArticleList;
              return <Card key={label} post={cardPost} {...handlers} />;
            })}
          </Column>
        ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Experiments/List card large actions',
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
