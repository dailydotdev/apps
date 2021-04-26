import React from 'react';
import { render, screen } from '@testing-library/react';

it('should succeed', async () => {
  render(<div>Hello</div>);
  expect(await screen.findByText('Hello')).toBeInTheDocument();
});
