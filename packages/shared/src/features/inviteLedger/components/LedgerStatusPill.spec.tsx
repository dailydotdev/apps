import React from 'react';
import { render, screen } from '@testing-library/react';
import { LedgerStatusPill } from './LedgerStatusPill';

describe('LedgerStatusPill', () => {
  it('renders Joined label with upvote accent', () => {
    render(<LedgerStatusPill status="joined" />);
    const pill = screen.getByText('Joined');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-action-upvote-default');
  });

  it('renders Pending label with bookmark accent', () => {
    render(<LedgerStatusPill status="pending" />);
    const pill = screen.getByText('Pending');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-action-bookmark-default');
  });

  it('renders Expired label with quaternary text', () => {
    render(<LedgerStatusPill status="expired" />);
    const pill = screen.getByText('Expired');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('text-text-quaternary');
  });
});
