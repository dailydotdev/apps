import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CreatorMetric } from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import {
  CreatorMetricSemantics,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { CreatorMetricTile } from '../components/analytics/creator/CreatorMetricTile';

const renderTile = (metric: CreatorMetric) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CreatorMetricTile
        label="Impressions"
        info="How many times your posts appeared."
        icon={null}
        metric={metric}
        period={CreatorPerformancePeriod.Last30Days}
        unknownReason="Daily impressions history does not reach this period."
      />
    </QueryClientProvider>,
  );

describe('CreatorMetricTile', () => {
  it('should show the reason instead of a zero when the value is unknown', () => {
    renderTile({
      value: null,
      previous: null,
      semantics: CreatorMetricSemantics.Period,
    });

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Daily impressions history does not reach this period.',
      ),
    ).toBeInTheDocument();
  });

  it('should show no comparison when the prior window is withheld', () => {
    renderTile({
      value: 120,
      previous: null,
      semantics: CreatorMetricSemantics.Period,
    });

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText('New')).not.toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should caption a lifetime metric as all time', () => {
    renderTile({
      value: 2100,
      previous: null,
      semantics: CreatorMetricSemantics.Lifetime,
    });

    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument();
  });

  it('should show the reason when a lifetime counter failed to load', () => {
    // Followers and reputation come from a separate query; if it fails the
    // tile must not settle on zero, which would read as "nobody follows you".
    renderTile({
      value: null,
      previous: null,
      semantics: CreatorMetricSemantics.Lifetime,
    });

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('should render a signed comparison when one is honest', () => {
    renderTile({
      value: 150,
      previous: 100,
      semantics: CreatorMetricSemantics.Period,
    });

    expect(screen.getByText(/\+/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
