import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreHeader } from './ExploreHeader';

const renderComponent = (props: Partial<{ activeTag: string }> = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreHeader recommendedTags={['vue', 'react']} {...props} />
    </TestBootProvider>,
  );

describe('ExploreHeader', () => {
  it('renders an Explore tab linking back to the lobby', () => {
    renderComponent();

    expect(screen.getByText('Explore').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('tags'),
    );
  });

  it('renders a tab per recommended topic', () => {
    renderComponent();

    expect(screen.getByText('#vue').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('tags/vue'),
    );
  });

  it('marks the active topic tab as current', () => {
    renderComponent({ activeTag: 'react' });

    expect(screen.getByText('#react').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
