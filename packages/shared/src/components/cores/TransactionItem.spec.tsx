import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TransactionItemProps } from './TransactionItem';
import { TransactionItem } from './TransactionItem';
import { author } from '../../../__tests__/fixture/loggedUser';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';

const renderComponent = (props: Partial<TransactionItemProps> = {}) =>
  render(
    <QueryClientProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
    >
      <TransactionItem
        type="receive"
        user={author}
        date={new Date('2026-01-01')}
        amount={100}
        label="Award"
        {...props}
      />
    </QueryClientProvider>,
  );

it('should render the note under the label', () => {
  renderComponent({ note: 'Thanks for the help!' });

  expect(screen.getByText('Thanks for the help!')).toBeInTheDocument();
});

it('should keep long notes clamped instead of slicing them', () => {
  const note = 'a'.repeat(400);
  renderComponent({ note });

  expect(screen.getByText(note)).toHaveClass('line-clamp-2');
});

it('should not render a note when there is none', () => {
  renderComponent();

  expect(screen.getByText('Award')).toBeInTheDocument();
  expect(screen.queryByText('Thanks for the help!')).not.toBeInTheDocument();
});
