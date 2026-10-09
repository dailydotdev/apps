import React from 'react';
import { render, screen } from '@testing-library/react';
import FollowingFeedEmptyScreen from './FollowingFeedEmptyScreen';

jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

describe('FollowingFeedEmptyScreen', () => {
  it('renders one CTA that links to the squads directory', () => {
    render(<FollowingFeedEmptyScreen />);

    expect(
      screen.getByRole('link', { name: 'Find people or squads' }),
    ).toHaveAttribute('href', 'https://daily.dev/squads');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
