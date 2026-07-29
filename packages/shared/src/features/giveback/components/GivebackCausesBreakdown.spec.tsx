import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackCausesBreakdown } from './GivebackCausesBreakdown';
import type { ContributionCauseCategoryBreakdown } from '../types';

// Resolve the reveal/count-up animations synchronously so assertions read the
// final values instead of mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

// Total 10,800 → 39% / 24% / 17% / 10% / 6% / 4% (rounded). The backend already
// groups the pool by category, so each row is one category.
const breakdown: ContributionCauseCategoryBreakdown[] = [
  { category: 'Open source', points: 4200 },
  { category: 'Education', points: 2600 },
  { category: 'Accessibility', points: 1800 },
  { category: 'Climate', points: 1100 },
  { category: 'Mentorship', points: 700 },
  { category: 'Docs', points: 400 },
];

describe('GivebackCausesBreakdown', () => {
  it('renders each category with its share and formatted amount', () => {
    render(<GivebackCausesBreakdown breakdown={breakdown} />);

    expect(screen.getByText('Open source')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    // Biggest slice: 4200 / 10800 ≈ 39%.
    expect(screen.getByText('39%')).toBeInTheDocument();
    expect(screen.getByText('$4,200')).toBeInTheDocument();
  });

  it('renders a custom title and an optional description', () => {
    render(
      <GivebackCausesBreakdown
        breakdown={breakdown}
        title="Where the money will go"
        description="The pool you are growing, by cause."
      />,
    );

    expect(screen.getByText('Where the money will go')).toBeInTheDocument();
    expect(
      screen.getByText('The pool you are growing, by cause.'),
    ).toBeInTheDocument();
  });

  it('renders the pool total in the donut hole', () => {
    render(<GivebackCausesBreakdown breakdown={breakdown} />);

    // Total 4200+2600+1800+1100+700+400 = 10,800.
    expect(screen.getByText('$10,800')).toBeInTheDocument();
  });

  it('labels the uncategorised bucket', () => {
    render(
      <GivebackCausesBreakdown
        breakdown={[
          { category: 'Open source', points: 3000 },
          { category: null, points: 1000 },
        ]}
      />,
    );

    expect(screen.getByText('Other causes')).toBeInTheDocument();
  });

  it('renders nothing when there is no breakdown', () => {
    const { container } = render(<GivebackCausesBreakdown breakdown={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when every category is zero', () => {
    const { container } = render(
      <GivebackCausesBreakdown
        breakdown={[{ category: 'Open source', points: 0 }]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
