import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ExploreHubHeader } from './ExploreHubHeader';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = (pathname: string) =>
  (useRouter as jest.Mock).mockReturnValue({ pathname });

describe('ExploreHubHeader', () => {
  it('renders the four hub tabs with their destinations', () => {
    mockRouter('/tags');
    render(<ExploreHubHeader />);

    expect(screen.getByText('Stories').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('posts'),
    );
    expect(screen.getByText('Topics').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('tags'),
    );
    expect(screen.getByText('Sources').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('sources'),
    );
    expect(screen.getByText('People').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('users'),
    );
  });

  it('marks the active tab from the current route', () => {
    mockRouter('/tags/[tag]');
    render(<ExploreHubHeader />);

    expect(screen.getByText('Topics').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Stories').closest('a')).not.toHaveAttribute(
      'aria-current',
    );
  });
});
