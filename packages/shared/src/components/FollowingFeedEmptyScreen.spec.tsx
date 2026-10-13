import React from 'react';
import { render, screen } from '@testing-library/react';
import FollowingFeedEmptyScreen from './FollowingFeedEmptyScreen';

jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

describe('FollowingFeedEmptyScreen', () => {
  it('renders the find squads and discover sources CTAs as links', () => {
    render(<FollowingFeedEmptyScreen />);

    expect(screen.getByRole('link', { name: 'Find Squads' })).toHaveAttribute(
      'href',
      'https://daily.dev/squads',
    );
    expect(
      screen.getByRole('link', { name: 'Discover Sources' }),
    ).toHaveAttribute('href', 'https://daily.dev/sources');
  });
});
