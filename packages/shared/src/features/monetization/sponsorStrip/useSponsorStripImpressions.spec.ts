import { renderHook } from '@testing-library/react';
import { useLogContext } from '../../../contexts/LogContext';
import { AdActions } from '../../../lib/ads';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { SponsorTier } from './sponsorStripCreative';
import type { SponsorSlot } from './sponsorStripSlots';
import { useSponsorStripImpressions } from './useSponsorStripImpressions';

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const logEvent = jest.fn();

const slot = (company: string, slotIndex: number): SponsorSlot => ({
  sponsor: {
    genId: `gen-${company}`,
    company,
    logo: `https://logo/${company}.svg`,
    ratio: 3,
    link: `https://${company}.dev`,
    pixel: [],
    tier: SponsorTier.Community,
  } as ResolvedSponsor,
  slotIndex,
});

const loggedCompanies = (call: number): string[] =>
  (
    JSON.parse(logEvent.mock.calls[call][0].extra).sponsors as {
      company: string;
    }[]
  ).map(({ company }) => company);

beforeEach(() => {
  jest.clearAllMocks();
  (useLogContext as jest.Mock).mockReturnValue({ logEvent });
});

it('should log nothing while the row holds no marks', () => {
  renderHook(() => useSponsorStripImpressions([]));

  expect(logEvent).not.toHaveBeenCalled();
});

it('should log the row once and not again for the same marks', () => {
  const { rerender } = renderHook(
    ({ slots }) => useSponsorStripImpressions(slots),
    { initialProps: { slots: [slot('a', 0), slot('b', 1)] } },
  );

  rerender({ slots: [slot('a', 0), slot('b', 1)] });

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent.mock.calls[0][0].event_name).toEqual(AdActions.Impression);
  expect(loggedCompanies(0)).toEqual(['a', 'b']);
});

it('should log only the marks a wider row adds, and a mark that comes back', () => {
  const { rerender } = renderHook(
    ({ slots }) => useSponsorStripImpressions(slots),
    { initialProps: { slots: [slot('a', 0), slot('b', 1)] } },
  );

  rerender({ slots: [slot('a', 0), slot('b', 1), slot('c', 2)] });
  rerender({ slots: [slot('a', 0)] });
  rerender({ slots: [slot('a', 0), slot('b', 1)] });

  expect(logEvent).toHaveBeenCalledTimes(3);
  expect(loggedCompanies(1)).toEqual(['c']);
  expect(loggedCompanies(2)).toEqual(['b']);
});
