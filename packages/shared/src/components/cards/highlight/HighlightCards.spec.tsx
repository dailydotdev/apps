import React from 'react';
import { render, screen } from '@testing-library/react';
import { HighlightGrid } from './HighlightGrid';
import { HighlightList } from './HighlightList';

const highlights = [
  {
    id: 'highlight-1',
    channel: 'agents',
    headline: 'The first highlight',
    highlightedAt: '2026-04-05T09:00:00.000Z',
    post: {
      id: 'post-1',
      commentsPermalink: '/posts/post-1',
    },
  },
  {
    id: 'highlight-2',
    channel: 'agents',
    headline: 'The second highlight',
    highlightedAt: '2026-04-05T08:00:00.000Z',
    post: {
      id: 'post-2',
      commentsPermalink: '/posts/post-2',
    },
  },
];

describe('Highlight cards', () => {
  it('should render the grid card with highlight links', () => {
    render(<HighlightGrid highlights={highlights} />);

    expect(screen.getByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });

  it('should render the list card with highlight links', () => {
    render(<HighlightList highlights={highlights} />);

    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });
});
