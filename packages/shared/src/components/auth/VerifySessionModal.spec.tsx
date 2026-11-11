import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import VerifySessionModal from './VerifySessionModal';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

it('opens the security check without an error', async () => {
  render(
    <TestBootProvider client={new QueryClient()} auth={{ isLoggedIn: true }}>
      <VerifySessionModal isOpen onVerified={jest.fn()} />
    </TestBootProvider>,
  );

  expect(await screen.findByTestId('login_form')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(
    screen.queryByText(/match our records|went wrong/),
  ).not.toBeInTheDocument();
});
