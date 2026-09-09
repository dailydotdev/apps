import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import { PostContentRaw } from './PostContent';

const renderContent = (post = postWithCommunitySentiment) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostContentRaw
        post={post}
        origin={Origin.ArticleModal}
        onClose={jest.fn()}
      />
    </TestBootProvider>,
  );

describe('PostContent community sentiment', () => {
  it('renders in the classic post modal when the post has a take', () => {
    renderContent();

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic post modal when the post has no take', () => {
    renderContent({ ...postWithCommunitySentiment, communitySentiment: null });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
