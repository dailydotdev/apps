import React from 'react';
import { render, screen } from '@testing-library/react';
import { SquadAudienceBreakdown } from './SquadAudienceBreakdown';

describe('SquadAudienceBreakdown', () => {
  it('should show each share with a bar scaled to the biggest row', () => {
    render(
      <SquadAudienceBreakdown
        title="Seniority"
        rows={[
          { label: '4-5 years', share: 40 },
          { label: '2-3 years', share: 20 },
        ]}
        empty="None yet"
      />,
    );

    expect(screen.getByText('4-5 years')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    const [top, second] = screen.getAllByTestId('audience-share');
    expect(top).toHaveStyle({ width: '100%' });
    expect(second).toHaveStyle({ width: '50%' });
  });

  it('should explain an empty breakdown', () => {
    render(
      <SquadAudienceBreakdown title="Their stack" rows={[]} empty="None yet" />,
    );

    expect(screen.getByText('None yet')).toBeInTheDocument();
  });
});
