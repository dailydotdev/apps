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
    expect(
      screen.getByText(/the fight is whether the fix breaks tool portability/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Common ground')).toBeInTheDocument();
    expect(screen.getByText('Where it splits')).toBeInTheDocument();
    expect(screen.getByText('Bottom line')).toBeInTheDocument();
    expect(screen.getByText(/strongest pushback/i)).toBeInTheDocument();
    // Cross-platform divergence read labels.
    expect(screen.getByText('Trading harness war-stories')).toBeInTheDocument();
    expect(screen.getByText('Sees vendor lock-in risk')).toBeInTheDocument();
  });

  it('keeps raw platform threads collapsed until requested', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('Community Pulse')).toBeInTheDocument(),
    );

    expect(
      screen.queryByText(/X · developer amplification/i),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /See the raw discussion/i }),
    );

    expect(
      screen.getByText(/X · developer amplification/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hacker News · front page/i)).toBeInTheDocument();
    // HN starts expanded, so its comments are visible.
    expect(screen.getByText('mappu')).toBeInTheDocument();
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

    expect(
      screen.queryByText(/X · developer amplification/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Hacker News · front page/i)).toBeInTheDocument();
  });
});
