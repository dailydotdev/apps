import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ArbitrageAnchor } from './ArbitrageAnchor';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';
import { FLOATING_LEADERBOARD_DELAY_MS } from './slots';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

jest.mock('../../../lib/constants', () => ({
  ...(jest.requireActual('../../../lib/constants') as Record<string, unknown>),
  isDevelopment: false,
}));

// The mocked module object is mutable, so tests toggle the flag directly.
const mockConstants = jest.requireMock('../../../lib/constants') as {
  isDevelopment: boolean;
};

const mockUseFeature = jest.mocked(useFeature);

const setSlots = (slots: ReadAdsenseSlots): void => {
  mockUseFeature.mockReturnValue(slots);
};

beforeEach(() => {
  mockConstants.isDevelopment = false;
});

describe('ArbitrageAdSlot', () => {
  it('renders nothing in production while the remote config is empty', () => {
    setSlots({});
    const { container } = render(
      <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the density-review placeholder only in development', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    render(<ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />);

    expect(screen.getByTestId('arbitrage-ad-slot-3')).toBeInTheDocument();
    expect(screen.queryByTestId('adsense-slot-3')).not.toBeInTheDocument();
  });

  it('drops phone-hidden slots below the tablet breakpoint', () => {
    setSlots({ '5': { id: '1234567890', type: 'inArticle' } });
    render(
      <ArbitrageAdSlot
        slot={5}
        format={ArbitrageAdFormat.Rectangle}
        hideOnPhone
      />,
    );

    expect(screen.getByTestId('adsense-slot-5').parentElement).toHaveClass(
      'hidden',
      'tablet:block',
    );
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

  it('serves test creatives on any host but production', () => {
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
  // The floating leaderboard is deliberately delayed, so every assertion about
  // it rendering has to run the timer forward first.
  const advancePastDelay = (): void => {
    act(() => {
      jest.advanceTimersByTime(FLOATING_LEADERBOARD_DELAY_MS);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing in production while the remote config is empty', () => {
    setSlots({});
    const { container } = render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the placeholder anchor in development', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(screen.getByTestId('arbitrage-ad-slot-13')).toBeInTheDocument();
  });

  it('stays unmounted until the delay elapses', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    const { container } = render(<ArbitrageAnchor />);

    expect(container).toBeEmptyDOMElement();
  });

  it('leaves the viewport bottom free when slot 13 is not configured', () => {
    mockConstants.isDevelopment = true;
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    const { container } = render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the floating leaderboard once slot 13 is configured', () => {
    setSlots({ '13': { id: '1313131313', type: 'display' } });
    render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(screen.getByTestId('adsense-slot-13')).toBeInTheDocument();
  });
});
