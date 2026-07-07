import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { ChatterSection } from './ChatterSection';

const post = { id: 'p1', permalink: 'https://example.com/article' } as Post;

const renderComponent = () => render(<ChatterSection post={post} />);

const waitForGlance = () =>
  waitFor(() =>
    expect(
      screen.getByText(/the fight is whether the fix breaks tool portability/i),
    ).toBeInTheDocument(),
  );

describe('ChatterSection', () => {
  it('shows a glanceable pulse and hides the breakdown by default', async () => {
    renderComponent();
    await waitForGlance();

    // The glance: verdict + sentiment + stance, all visible at once.
    expect(screen.getByText(/58% agree/i)).toBeInTheDocument();
    expect(screen.getByText('divided')).toBeInTheDocument();

    // The breakdown is collapsed until asked for.
    expect(screen.queryByText('Common ground')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Show the full breakdown/i }),
    );

    expect(screen.getByText('Common ground')).toBeInTheDocument();
    expect(screen.getByText('Bottom line')).toBeInTheDocument();
    expect(screen.getByText('Trading harness war-stories')).toBeInTheDocument();
  });

  it('keeps raw platform threads collapsed until requested', async () => {
    renderComponent();
    await waitForGlance();

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
    expect(screen.getByText('mappu')).toBeInTheDocument();
  });

  it('filters raw sources by platform', async () => {
    renderComponent();
    await waitForGlance();
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
