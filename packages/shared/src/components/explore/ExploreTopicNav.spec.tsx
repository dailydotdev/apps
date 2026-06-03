import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreTopicNav } from './ExploreTopicNav';

const renderComponent = (props: Partial<{ activeTag: string }> = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreTopicNav recommendedTags={['vue', 'react']} {...props} />
    </TestBootProvider>,
  );

describe('ExploreTopicNav', () => {
  it('should link Explore back to the lobby', () => {
    renderComponent();

    expect(screen.getByText('Explore').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('tags'),
    );
  });

  it('should render recommended tags linking to their topic page', () => {
    renderComponent();

    expect(screen.getByText('#vue').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('tags/vue'),
    );
  });

  it('should mark the active tag as current and pin it first', () => {
    renderComponent({ activeTag: 'react' });

    const activeChip = screen.getByText('#react').closest('a');
    expect(activeChip).toHaveAttribute('aria-current', 'page');
  });
});
