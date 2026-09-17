import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
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

describe('CollectionPostContent selection snapshot', () => {
  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('offers a snapshot of a quote selected in the collection', () => {
    renderContent(collectionPostWithCommunitySentiment);

    const node = screen.getByTestId('post-modal-title').firstChild as Node;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length ?? 0);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // The reader letting go of the drag is what commits the quote.
    fireEvent.pointerUp(document);

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });
});
