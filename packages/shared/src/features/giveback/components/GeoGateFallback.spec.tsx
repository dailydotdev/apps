import React from 'react';
import { render, screen } from '@testing-library/react';
import { GeoGateFallback } from './GeoGateFallback';

it('explains that giveback is not available in the visitor region', () => {
  render(<GeoGateFallback />);

  expect(
    screen.getByRole('heading', {
      name: 'Giveback is not available in your country yet',
    }),
  ).toBeInTheDocument();
  expect(screen.getByText('Giveback by daily.dev')).toBeInTheDocument();
  expect(
    screen.getByText(/rolling out to more countries soon/i),
  ).toBeInTheDocument();
});
