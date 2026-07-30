import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import ExtensionProviders from '../../extension/_providers';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';

const basePost = {
  id: 'article-1',
  title:
    'Cloud Run now scales to zero, even when your service uses less than a single CPU or less than 1792 MB of memory',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  readTime: 8,
  tags: ['javascript'],
  type: PostType.Article,
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine' as const,
    active: true,
  },
} as unknown as Post;

const makePost = (
  id: string,
  numUpvotes: number,
  numComments: number,
  impressions: number,
): Post =>
  ({
    ...basePost,
    id,
    numUpvotes,
    numComments,
    analytics: { impressions },
  } as Post);

const cases = [
  { label: '36 · 3 · 52.4K', post: makePost('a', 36, 3, 52400) },
  { label: '100 · 80 · 100K', post: makePost('b', 100, 80, 100000) },
  { label: '200 · 80 · 200K', post: makePost('c', 200, 80, 234500) },
  { label: '9999 · 999 · 1.2M', post: makePost('d', 9999, 999, 1200000) },
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

const v1 = {
  card_impressions: true,
  engagement_bar_v2: false,
  feed_card_glass_actions: false,
};
const v2 = { ...v1, engagement_bar_v2: true };
const glass = { ...v1, feed_card_glass_actions: true };

const Row = ({
  title,
  values,
  width,
}: {
  title: string;
  values: Record<string, unknown>;
  width: string;
}) => (
  <div className="mb-10">
    <h3 className="mb-3 text-base font-bold text-text-primary">{title}</h3>
    <div className="flex gap-6">
      {cases.map(({ label, post }) => (
        <div key={label} style={{ width }}>
          <p className="mb-2 text-xs text-text-tertiary">{label}</p>
          <FeatureOverrides values={values}>
            <ArticleGrid post={post} {...handlers} />
          </FeatureOverrides>
        </div>
      ))}
    </div>
  </div>
);

const ActionBarAlignment = () => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default p-8">
      <Row title="Default bar (v1) — 320px" values={v1} width="20rem" />
      <Row
        title="Default bar (v1) — 272px min card width"
        values={v1}
        width="17rem"
      />
      <Row title="Default bar (v2) — 320px" values={v2} width="20rem" />
      <Row
        title="Default bar (v2) — 272px min card width"
        values={v2}
        width="17rem"
      />
      <Row title="Floating glass bar — 320px" values={glass} width="20rem" />
      <Row
        title="Floating glass bar — 272px min card width"
        values={glass}
        width="17rem"
      />
    </div>
  </ExtensionProviders>
);

const meta: Meta<typeof ActionBarAlignment> = {
  title: 'Components/Cards/ActionBarAlignment',
  component: ActionBarAlignment,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof ActionBarAlignment> = {};
