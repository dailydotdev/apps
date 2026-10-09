import React from 'react';
import { render, screen } from '@testing-library/react';
import ReadingHistoryEmptyScreen from './ReadingHistoryEmptyScreen';

jest.mock('../../lib/constants', () => ({
  ...jest.requireActual('../../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

describe('ReadingHistoryEmptyScreen', () => {
  it('renders the browse popular CTA as a link', () => {
    render(<ReadingHistoryEmptyScreen />);

    expect(
      screen.getByRole('link', { name: 'Browse Popular' }),
    ).toHaveAttribute('href', 'https://daily.dev/popular');
  });
});
