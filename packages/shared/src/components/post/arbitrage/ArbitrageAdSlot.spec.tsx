import React from 'react';
import { render, screen } from '@testing-library/react';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ArbitrageAnchor } from './ArbitrageAnchor';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

const mockUseFeature = jest.mocked(useFeature);

const setSlots = (slots: ReadAdsenseSlots): void => {
  mockUseFeature.mockReturnValue(slots);
};

describe('ArbitrageAdSlot', () => {
  it('renders the reserved placeholder while the remote config is empty', () => {
    setSlots({});
    render(<ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />);

    expect(screen.getByTestId('arbitrage-ad-slot-3')).toBeInTheDocument();
    expect(screen.queryByTestId('adsense-slot-3')).not.toBeInTheDocument();
  });

  it('renders a live in-article unit when the slot is configured', () => {
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    render(<ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />);

    const ins = screen.getByTestId('adsense-slot-3');
    expect(ins).toHaveClass('adsbygoogle');
    expect(ins).toHaveAttribute('data-ad-client', ADSENSE_CLIENT_ID);
    expect(ins).toHaveAttribute('data-ad-slot', '1234567890');
    expect(ins).toHaveAttribute('data-ad-layout', 'in-article');
    expect(ins).toHaveAttribute('data-ad-format', 'fluid');
    expect(screen.queryByTestId('arbitrage-ad-slot-3')).not.toBeInTheDocument();
  });

  it('serves test creatives outside production', () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(<ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} />);

    expect(screen.getByTestId('adsense-slot-2')).toHaveAttribute(
      'data-adtest',
      'on',
    );
  });

  it('renders fixed-size units at exactly the configured size', () => {
    setSlots({
      '10': { id: '3333333333', type: 'display', width: 300, height: 600 },
    });
    render(<ArbitrageAdSlot slot={10} format={ArbitrageAdFormat.HalfPage} />);

    const ins = screen.getByTestId('adsense-slot-10');
    expect(ins).toHaveStyle({ width: '300px', height: '600px' });
    expect(ins).not.toHaveAttribute('data-ad-format');
  });

  it('collapses unconfigured slots in live mode instead of showing placeholders', () => {
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    const { container } = render(
      <ArbitrageAdSlot slot={4} format={ArbitrageAdFormat.Video} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ArbitrageAnchor', () => {
  it('renders the placeholder anchor while the remote config is empty', () => {
    setSlots({});
    render(<ArbitrageAnchor />);

    expect(screen.getByTestId('arbitrage-ad-slot-13')).toBeInTheDocument();
  });

  it('unmounts in live mode so the Auto ads anchor owns the viewport bottom', () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    const { container } = render(<ArbitrageAnchor />);

    expect(container).toBeEmptyDOMElement();
  });
});
