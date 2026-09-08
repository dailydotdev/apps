import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  postWithCommunitySentiment,
  sharePost,
} from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { SquadPostContentRaw } from './SquadPostContent';

jest.mock('./SquadPostWidgets', () => ({
  SquadPostWidgets: () => <aside />,
}));

const sharedPostWithCommunitySentiment: Post = {
  ...sharePost,
  sharedPost: {
    ...sharePost.sharedPost!,
    communitySentiment: postWithCommunitySentiment.communitySentiment,
  },
};

const renderContent = (post: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SquadPostContentRaw post={post} origin={Origin.ArticleModal} />
    </TestBootProvider>,
  );

describe('SquadPostContent community sentiment', () => {
  it('renders in the classic share post layout when the shared post has a take', () => {
    renderContent(sharedPostWithCommunitySentiment);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic share post layout when the shared post has no take', () => {
    renderContent(sharePost);

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
