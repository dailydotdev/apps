import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import { featureCommunitySentiment } from '../../lib/featureManagement';
import { PostContentRaw } from './PostContent';

const renderContent = (gb?: GrowthBook) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <PostContentRaw
        post={postWithCommunitySentiment}
        origin={Origin.ArticleModal}
        onClose={jest.fn()}
      />
    </TestBootProvider>,
  );

describe('PostContent community sentiment', () => {
  it('renders in the classic post modal when the flag is enabled', () => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureCommunitySentiment.id]: {
        defaultValue: true,
      },
    });

    renderContent(gb);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic post modal when the flag is disabled', () => {
    renderContent();

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
