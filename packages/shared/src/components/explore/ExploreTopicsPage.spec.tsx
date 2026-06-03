import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreTopicsPage } from './ExploreTopicsPage';
import type { Keyword } from '../../graphql/keywords';

const makeTag = (value: string): Keyword => ({
  value,
  occurrences: 1,
  status: 'allow',
});

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreTopicsPage
        tags={[makeTag('react'), makeTag('vue')]}
        trendingTags={[makeTag('react')]}
        popularTags={[makeTag('vue')]}
      />
    </TestBootProvider>,
  );

const getLetterSection = (letter: string): HTMLElement => {
  const section = screen
    .getByRole('heading', { name: letter })
    .closest('section');
  if (!section) {
    throw new Error(`letter section ${letter} not found`);
  }
  return section;
};

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

  it('should render an A–Z filter with enabled letters for present tags', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'r' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'v' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'a' })).toBeDisabled();
  });

  it('should group tags alphabetically by first letter', () => {
    renderComponent();

    expect(
      within(getLetterSection('r')).getByText('React'),
    ).toBeInTheDocument();
    expect(within(getLetterSection('v')).getByText('Vue')).toBeInTheDocument();
  });

  it('should link topic entries to the explore topic page', () => {
    renderComponent();

    expect(
      within(getLetterSection('r')).getByText('React').closest('a'),
    ).toHaveAttribute('href', expect.stringContaining('explore/react'));
  });

  it('should filter the directory to a single letter', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'v' }));

    expect(
      screen.queryByRole('heading', { name: 'r' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'v' })).toBeInTheDocument();
  });

  it('should render the trending / popular / recently added lists', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: /Trending tags/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Popular tags/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Recently added tags/ }),
    ).toBeInTheDocument();
  });
});
