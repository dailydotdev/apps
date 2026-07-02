import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackCausesBreakdown } from './GivebackCausesBreakdown';
import type {
  GivebackBreakdownVariant,
  GivebackCauseAllocation,
} from './GivebackCausesBreakdown';
import type { ContributionCause } from '../types';

// Resolve the reveal/count-up animations synchronously so assertions read the
// final values instead of mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

const cause = (id: string, title: string): ContributionCause => ({
  id,
  title,
  url: null,
  description: null,
  category: null,
  logoUrl: null,
});

// Total 10,800 → 39% / 24% / 17% / 10% / 6% / 4% (rounded).
const allocations: GivebackCauseAllocation[] = [
  { cause: cause('oss', 'Open-source maintainers'), amount: 4200 },
  { cause: cause('scholar', 'Dev scholarships'), amount: 2600 },
  { cause: cause('access', 'Access to tech'), amount: 1800 },
  { cause: cause('climate', 'Climate tech'), amount: 1100 },
  { cause: cause('mentor', 'Mentorship programs'), amount: 700 },
  { cause: cause('docs', 'Better docs'), amount: 400 },
];

describe('GivebackCausesBreakdown', () => {
  it('renders each cause with its share and formatted amount', () => {
    render(<GivebackCausesBreakdown allocations={allocations} />);

    expect(screen.getByText('Open-source maintainers')).toBeInTheDocument();
    expect(screen.getByText('Better docs')).toBeInTheDocument();
    // Biggest slice: 4200 / 10800 ≈ 39%.
    expect(screen.getByText('39%')).toBeInTheDocument();
    expect(screen.getByText('$4,200')).toBeInTheDocument();
  });

  it('renders a custom title and an optional description', () => {
    render(
      <GivebackCausesBreakdown
        allocations={allocations}
        title="Where the money will go"
        description="The pool you are growing, by cause."
      />,
    );

    expect(screen.getByText('Where the money will go')).toBeInTheDocument();
    expect(
      screen.getByText('The pool you are growing, by cause.'),
    ).toBeInTheDocument();
  });

  it.each<GivebackBreakdownVariant>(['stacked', 'donut', 'silos', 'mosaic'])(
    'renders the %s variant without crashing',
    (variant) => {
      render(
        <GivebackCausesBreakdown allocations={allocations} variant={variant} />,
      );

      expect(
        screen.getAllByText('Open-source maintainers').length,
      ).toBeGreaterThan(0);
    },
  );

  it('renders nothing when there are no allocations', () => {
    const { container } = render(<GivebackCausesBreakdown allocations={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when every allocation is zero', () => {
    const { container } = render(
      <GivebackCausesBreakdown
        allocations={[{ cause: cause('oss', 'Open source'), amount: 0 }]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
