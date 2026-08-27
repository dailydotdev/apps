import React from 'react';
import { render, screen } from '@testing-library/react';
import ReadingHistoryEmptyScreen from './ReadingHistoryEmptyScreen';

const originalWebappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL;

describe('ReadingHistoryEmptyScreen', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WEBAPP_URL = 'https://daily.dev/';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_WEBAPP_URL = originalWebappUrl;
  });

  it('renders the back to feed CTA as a link', () => {
    render(<ReadingHistoryEmptyScreen />);

    expect(screen.getByRole('link', { name: 'Back to feed' })).toHaveAttribute(
      'href',
      'https://daily.dev/',
    );
  });
});
