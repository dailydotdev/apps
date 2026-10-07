import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ExploreSegments } from './ExploreSegments';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useIsPhone } from '../../hooks/useViewSize';
import { featureInterestAgent } from '../../lib/featureManagement';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../contexts/AuthContext', () => ({ useAuthContext: jest.fn() }));
jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useIsPhone: jest.fn(),
}));

const mockAuth = jest.mocked(useAuthContext);
const mockFeature = jest.mocked(useConditionalFeature);

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
    jest.mocked(useIsPhone).mockReturnValue(true);
    mockAuth.mockReturnValue({ isLoggedIn: true } as ReturnType<
      typeof useAuthContext
    >);
    mockFeature.mockReturnValue({ value: false, isLoading: false });
  });

  it('lists the places of Explore with the page lit', () => {
    render(<ExploreSegments />);

    expect(labels()).toEqual([
      'Posts',
      'Discussions',
      'Tags',
      'Sources',
      'Leaderboard',
    ]);
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

  it('adds Agents right after Posts for members in the experiment', () => {
    mockFeature.mockReturnValue({ value: true, isLoading: false });
    render(<ExploreSegments />);

    expect(labels()).toEqual([
      'Posts',
      'Agents',
      'Discussions',
      'Tags',
      'Sources',
      'Leaderboard',
    ]);
  });

  it('never evaluates the Agents flag for a visitor or off a phone', () => {
    mockAuth.mockReturnValue({ isLoggedIn: false } as ReturnType<
      typeof useAuthContext
    >);
    render(<ExploreSegments />);
    expect(mockFeature).toHaveBeenCalledWith({
      feature: featureInterestAgent,
      shouldEvaluate: false,
    });

    mockAuth.mockReturnValue({ isLoggedIn: true } as ReturnType<
      typeof useAuthContext
    >);
    jest.mocked(useIsPhone).mockReturnValue(false);
    render(<ExploreSegments />);
    expect(mockFeature).toHaveBeenLastCalledWith({
      feature: featureInterestAgent,
      shouldEvaluate: false,
    });
  });
});
