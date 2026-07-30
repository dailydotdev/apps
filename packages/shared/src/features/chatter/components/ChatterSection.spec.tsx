import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { ChatterSection } from './ChatterSection';

const post = { id: 'p1', permalink: 'https://example.com/article' } as Post;

const renderComponent = () => render(<ChatterSection post={post} />);

const waitForGlance = () =>
  waitFor(() =>
    expect(screen.getByText(/X is calling the top/i)).toBeInTheDocument(),
  );

describe('ChatterSection', () => {
  it('shows a glanceable pulse and hides the breakdown by default', async () => {
    renderComponent();
    await waitForGlance();

    // The glance: verdict + sentiment + stance, all visible at once.
    expect(screen.getByText(/48% agree/i)).toBeInTheDocument();
    expect(screen.getByText('divided')).toBeInTheDocument();

    // The breakdown is collapsed until asked for.
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Show the full breakdown/i }),
    );

    expect(screen.getByText('Highlights')).toBeInTheDocument();
    expect(screen.getByText('The bull case')).toBeInTheDocument();
    expect(screen.getByText('The skeptic')).toBeInTheDocument();
    expect(screen.getByText('Bottom line')).toBeInTheDocument();
    expect(
      screen.getByText('Declaring victory for open weights'),
    ).toBeInTheDocument();
  });

  it('keeps raw platform threads collapsed until requested', async () => {
    renderComponent();
    await waitForGlance();

    expect(screen.queryByText(/X · widely shared/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /See the raw discussion/i }),
    );

    expect(screen.getByText(/X · widely shared/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hacker News · #1 on the front page/i),
    ).toBeInTheDocument();
    expect(screen.getByText('zackify')).toBeInTheDocument();
  });

  it('filters raw sources by platform', async () => {
    renderComponent();
    await waitForGlance();
    fireEvent.click(
      screen.getByRole('button', { name: /See the raw discussion/i }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hacker News' }));

    expect(screen.queryByText(/X · widely shared/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Hacker News · #1 on the front page/i),
    ).toBeInTheDocument();
  });
});
