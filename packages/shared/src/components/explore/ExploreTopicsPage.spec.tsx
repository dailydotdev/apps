import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreTopicsPage } from './ExploreTopicsPage';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';

const makeTag = (value: string): Keyword => ({
  value,
  occurrences: 1,
  status: 'allow',
});

const categories: TagCategory[] = [
  {
    id: 'webdev',
    title: 'Web Development',
    emoji: '🌐',
    tags: ['react', 'vue'],
  },
];

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreTopicsPage
        tags={[makeTag('react'), makeTag('vue')]}
        trendingTags={[makeTag('react')]}
        popularTags={[makeTag('vue')]}
        tagsCategories={categories}
      />
    </TestBootProvider>,
  );

describe('ExploreTopicsPage', () => {
  it('should render the explore hero and search', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Explore topics' }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search all topics'),
    ).toBeInTheDocument();
  });

  it('should render category sections with their tags', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: /Web Development/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('should link topic entries to the explore topic page', () => {
    renderComponent();

    expect(screen.getByText('React').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('explore/react'),
    );
  });
});
