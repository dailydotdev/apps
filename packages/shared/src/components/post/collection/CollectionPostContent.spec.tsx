import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { CollectionPostContentRaw } from './CollectionPostContent';

jest.mock('./CollectionPostWidgets', () => ({
  CollectionPostWidgets: () => <aside />,
}));

const collectionPostWithCommunitySentiment: Post = {
  ...postWithCommunitySentiment,
  id: 'collection-with-community-sentiment',
  type: PostType.Collection,
  title: 'Collection with a community take',
  contentHtml: '<p>Collection body</p>',
  numCollectionSources: 2,
};

const renderContent = (post: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <CollectionPostContentRaw post={post} origin={Origin.ArticleModal} />
    </TestBootProvider>,
  );

describe('CollectionPostContent community sentiment', () => {
  it('renders in the classic collection layout when the post has a take', () => {
    renderContent(collectionPostWithCommunitySentiment);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic collection layout when the post has no take', () => {
    renderContent({
      ...collectionPostWithCommunitySentiment,
      communitySentiment: null,
    });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
