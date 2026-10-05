import React from 'react';
import { render, screen } from '@testing-library/react';
import { SquadAudienceBreakdown } from './SquadAudienceBreakdown';

describe('SquadAudienceBreakdown', () => {
  it('should draw each row at its real share', () => {
    render(
      <SquadAudienceBreakdown
        title="Companies they work at"
        rows={[
          { label: 'Shopify', share: 6 },
          { label: 'Stripe', share: 3 },
        ]}
        empty="None yet"
      />,
    );

    expect(screen.getByText('Shopify')).toBeInTheDocument();
    expect(screen.getByText('6%')).toBeInTheDocument();
    expect(screen.getAllByTestId('audience-share')[0]).toHaveStyle({
      width: '6%',
    });
  });

  it('should explain an empty breakdown', () => {
    render(
      <SquadAudienceBreakdown title="Their stack" rows={[]} empty="None yet" />,
    );

    expect(screen.getByText('None yet')).toBeInTheDocument();
  });
});
