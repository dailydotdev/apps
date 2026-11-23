import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ExploreSegments } from './ExploreSegments';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const labels = () =>
  screen.getAllByRole('link').map((link) => link.textContent?.trim());
const lit = () =>
  screen
    .getAllByRole('link')
    .find((link) => link.getAttribute('aria-current') === 'page')
    ?.textContent?.trim();

describe('ExploreSegments', () => {
  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue({
      pathname: '/posts',
    } as ReturnType<typeof useRouter>);
  });

  it('lists the places of Explore with the page lit', () => {
    render(<ExploreSegments />);

    expect(labels()).toEqual(['Posts', 'Tags', 'Sources', 'Leaderboard']);
    expect(lit()).toBe('Posts');
  });

  it('lights Posts on the sorts and Tags on the tags directory', () => {
    jest.mocked(useRouter).mockReturnValue({
      pathname: '/posts/upvoted',
    } as ReturnType<typeof useRouter>);
    const { unmount } = render(<ExploreSegments />);
    expect(lit()).toBe('Posts');
    unmount();

    jest.mocked(useRouter).mockReturnValue({
      pathname: '/tags',
    } as ReturnType<typeof useRouter>);
    render(<ExploreSegments />);
    expect(lit()).toBe('Tags');
  });
});
