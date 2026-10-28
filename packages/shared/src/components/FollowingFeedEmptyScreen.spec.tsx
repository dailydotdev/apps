import React from 'react';
import { render, screen } from '@testing-library/react';
import FollowingFeedEmptyScreen from './FollowingFeedEmptyScreen';

jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

describe('FollowingFeedEmptyScreen', () => {
  it('links to the squads directory and to sources', () => {
    render(<FollowingFeedEmptyScreen />);

    expect(
      screen.getByRole('link', { name: 'Find people or squads' }),
    ).toHaveAttribute('href', 'https://daily.dev/squads');
    expect(
      screen.getByRole('link', { name: 'Discover Sources' }),
    ).toHaveAttribute('href', 'https://daily.dev/sources');
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
