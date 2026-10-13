import React from 'react';
import { render, screen } from '@testing-library/react';
import ReadingHistoryEmptyScreen from './ReadingHistoryEmptyScreen';

jest.mock('../../lib/constants', () => ({
  ...jest.requireActual('../../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

describe('ReadingHistoryEmptyScreen', () => {
  it('sends an empty history back to the feed', () => {
    render(<ReadingHistoryEmptyScreen />);

    expect(screen.getByRole('link', { name: 'Back to feed' })).toHaveAttribute(
      'href',
      'https://daily.dev/',
    );
  });
});
