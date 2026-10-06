import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExplorePlaces } from './ExplorePlaces';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureInterestAgent } from '../../lib/featureManagement';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockAuth = jest.mocked(useAuthContext);
const mockFeature = jest.mocked(useConditionalFeature);

const rows = () =>
  screen.getAllByRole('link').map((link) => link.textContent?.trim());

describe('ExplorePlaces', () => {
  beforeEach(() => {
    mockAuth.mockReturnValue({ isLoggedIn: true } as ReturnType<
      typeof useAuthContext
    >);
    mockFeature.mockReturnValue({ value: false, isLoading: false });
  });

  it('lists the places a phone reaches from Explore', () => {
    render(<ExplorePlaces />);

    expect(rows()).toEqual(['Discussions', 'Tags', 'Sources', 'Leaderboard']);
    expect(screen.getByRole('link', { name: 'Tags' })).toHaveAttribute(
      'href',
      expect.stringMatching(/tags$/),
    );
  });

  it('adds Agents before Leaderboard for members in the experiment', () => {
    mockFeature.mockReturnValue({ value: true, isLoading: false });
    render(<ExplorePlaces />);

    expect(rows()).toEqual([
      'Discussions',
      'Tags',
      'Sources',
      'Agents',
      'Leaderboard',
    ]);
  });

  it('never evaluates the Agents flag for a visitor', () => {
    mockAuth.mockReturnValue({ isLoggedIn: false } as ReturnType<
      typeof useAuthContext
    >);
    render(<ExplorePlaces />);

    expect(mockFeature).toHaveBeenCalledWith({
      feature: featureInterestAgent,
      shouldEvaluate: false,
    });
  });
});
