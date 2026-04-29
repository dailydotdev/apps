import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimeDropdown } from './TimeDropdown';

describe('TimeDropdown', () => {
  it('labels the hour and minute triggers separately', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimeDropdown
          value={9 * 60 + 15}
          ariaLabel="Monday start"
          onChange={jest.fn()}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Monday start hour' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Monday start minute' }),
    ).toBeInTheDocument();
  });
});
