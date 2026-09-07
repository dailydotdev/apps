import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackPage } from './GivebackPage';

it('thanks contributors and marks the campaign as closed', () => {
  render(<GivebackPage />);

  expect(screen.getByText('Campaign closed')).toBeInTheDocument();
  expect(screen.getByText('Thank you for giving back.')).toBeInTheDocument();
});

// The by-cause split is gone with the API schema behind it; the page must not
// reach for it again.
it('no longer renders the causes breakdown', () => {
  render(<GivebackPage />);

  expect(screen.queryByText('Where the money goes')).not.toBeInTheDocument();
});
