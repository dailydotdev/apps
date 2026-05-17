import React from 'react';
import { render, screen } from '@testing-library/react';
import { LedgerStatusPill } from './LedgerStatusPill';

describe('LedgerStatusPill', () => {
  it('renders Joined with avocado accent', () => {
    render(<LedgerStatusPill status="joined" />);
    const pill = screen.getByText('Joined');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-accent-avocado-default');
  });

  it('renders Pending label with cheese accent', () => {
    render(<LedgerStatusPill status="pending" />);
    const pill = screen.getByText('Pending');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-accent-cheese-default');
  });

  it('renders Expired label with tertiary text', () => {
    render(<LedgerStatusPill status="expired" />);
    const pill = screen.getByText('Expired');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-text-tertiary');
  });
});
