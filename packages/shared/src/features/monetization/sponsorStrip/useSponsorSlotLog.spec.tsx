import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { useAdMacroContext } from '../useAdMacroContext';
import { resolveSponsor, SponsorTier } from './sponsorStripCreative';
import { useSponsorSlotLog } from './useSponsorSlotLog';

jest.mock('../useAdMacroContext', () => ({ useAdMacroContext: jest.fn() }));
jest.mock('../useVisibleTime', () => ({
  useVisibleTime: () => ({ ref: jest.fn() }),
}));

const originalIntersectionObserver = global.IntersectionObserver;

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  global.IntersectionObserver = originalIntersectionObserver;
});

it('waits for consent before measuring and does not consume the pending milestones', () => {
  jest.useFakeTimers();
  jest.mocked(useAdMacroContext).mockReturnValue(null);
  jest.spyOn(document, 'hasFocus').mockReturnValue(true);
  let callback: IntersectionObserverCallback = () => undefined;
  global.IntersectionObserver = jest.fn().mockImplementation((next) => {
    callback = next;
    return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
  });
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const sponsor = resolveSponsor({
    generation_id: 'consent-delayed-sponsor',
    company_name: 'Sponsor',
    icon: 'https://images.example/logo.svg',
    link: 'https://advertiser.example',
    pixels: [],
    tier: SponsorTier.Community,
    lifecycle: {
      version: 1,
      on: {
        visible: [
          {
            type: 'pixel',
            // eslint-disable-next-line no-template-curly-in-string -- Ad server macros.
            url: 'https://tracking.example/visible?gdpr=${GDPR}&tc=${GDPR_CONSENT_755}',
          },
        ],
        'half-visible': [
          { type: 'pixel', url: 'https://tracking.example/half' },
        ],
        'visible-for-1s': [
          { type: 'pixel', url: 'https://tracking.example/second' },
        ],
        viewable: [{ type: 'pixel', url: 'https://tracking.example/viewable' }],
        click: [
          {
            type: 'pixel',
            // eslint-disable-next-line no-template-curly-in-string -- Ad server macros.
            url: 'https://tracking.example/click?tc=${GDPR_CONSENT_755}',
          },
        ],
      },
    },
  });
  const client = new QueryClient();
  const gb = new GrowthBook({
    features: { ad_slot_lifecycle: { defaultValue: true } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} gb={gb}>
      {children}
    </TestBootProvider>
  );
  const { result, rerender } = renderHook(
    () => useSponsorSlotLog({ sponsor, slotIndex: 0 }),
    { wrapper },
  );
  act(() => result.current.ref(document.createElement('a')));
  act(() => result.current.onClick());
  expect(IntersectionObserver).not.toHaveBeenCalled();
  expect(src).not.toHaveBeenCalled();

  jest
    .mocked(useAdMacroContext)
    .mockReturnValue({ gdprApplies: true, consentString: 'resolved-consent' });
  rerender();
  expect(IntersectionObserver).toHaveBeenCalledTimes(1);
  act(() =>
    callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 0.5,
          boundingClientRect: { width: 100, height: 20 } as DOMRect,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    ),
  );
  act(() => jest.advanceTimersByTime(1_000));
  expect(src.mock.calls).toEqual([
    ['https://tracking.example/visible?gdpr=1&tc=resolved-consent'],
    ['https://tracking.example/half'],
    ['https://tracking.example/second'],
    ['https://tracking.example/viewable'],
  ]);
  act(() => result.current.onClick());
  expect(src).toHaveBeenLastCalledWith(
    'https://tracking.example/click?tc=resolved-consent',
  );
});
