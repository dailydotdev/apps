import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { ChatterSection } from './ChatterSection';

const post = { id: 'p1', permalink: 'https://example.com/article' } as Post;

const renderComponent = () => render(<ChatterSection post={post} />);

describe('ChatterSection', () => {
  it('leads with the synthesized community pulse', async () => {
    renderComponent();

    await waitFor(() =>
      expect(screen.getByText('Community Pulse')).toBeInTheDocument(),
    );
    expect(screen.getByText(/The room is split/i)).toBeInTheDocument();
    expect(screen.getByText('Common ground')).toBeInTheDocument();
    expect(screen.getByText('Where it splits')).toBeInTheDocument();
    expect(screen.getByText('Bottom line')).toBeInTheDocument();
    expect(screen.getByText(/strongest pushback/i)).toBeInTheDocument();
    // Cross-platform divergence read labels.
    expect(screen.getByText('Polarized & loud')).toBeInTheDocument();
    expect(screen.getByText('Skeptical')).toBeInTheDocument();
  });

  it('keeps raw platform threads collapsed until requested', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('Community Pulse')).toBeInTheDocument(),
    );

    expect(screen.queryByText(/X · 3 posts trending/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /See the raw discussion/i }),
    );

    expect(screen.getByText(/X · 3 posts trending/i)).toBeInTheDocument();
    expect(screen.getByText(/Hacker News · front page/i)).toBeInTheDocument();
    // X starts expanded, so its top post is visible.
    expect(screen.getByText(/@t3dotgg/i)).toBeInTheDocument();
  });

  it('filters raw sources by platform', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('Community Pulse')).toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /See the raw discussion/i }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hacker News' }));

    expect(screen.queryByText(/X · 3 posts trending/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Hacker News · front page/i)).toBeInTheDocument();
  });
});
