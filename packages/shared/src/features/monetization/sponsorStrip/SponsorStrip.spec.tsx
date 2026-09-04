import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import type { PostHighlight } from '../../../graphql/highlights';
import { AdActions } from '../../../lib/ads';
import { LogEvent } from '../../../lib/log';
import type { SponsorStripConfig } from '../../../types';
import { SponsorStrip } from './SponsorStrip';
import { fetchSponsorStripAds } from './mockSponsorStripAds';
import { SponsorTier } from './sponsorStripCreative';

jest.mock('./mockSponsorStripAds', () => ({
  fetchSponsorStripAds: jest.fn(),
}));

jest.mock('../../../hooks/utils/useThemedAsset', () => ({
  useIsLightTheme: () => false,
}));

const mockFetch = jest.mocked(fetchSponsorStripAds);
let headlines: PostHighlight[] = [];

const config: SponsorStripConfig = {
  enabled: true,
  premiumRotationMs: 40_000,
  communityRotationMs: 8_000,
};

const creative = (
  company: string,
  tier: SponsorTier,
  pixel: string[] = [],
) => ({
  gen_id: `gen-${company}`,
  company,
  logo_img: { light: `light-${company}`, dark: `dark-${company}` },
  logo_ratio: 3,
  link: `https://daily.dev/${company}`,
  pixel,
  tier,
});

const headline = (id: string): PostHighlight => ({
  id,
  channel: 'agents',
  headline: `Headline ${id}`,
  highlightedAt: new Date().toISOString(),
  post: { id: `post-${id}`, commentsPermalink: `https://daily.dev/p/${id}` },
});

const PREMIUM = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const COMMUNITY = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];

// Wide enough for eight wall slots — four premium, four community — which
// leaves the community deck bigger than the row it fills, the only state in
// which a rotation has anywhere to go.
const WALL_WIDTH = 900;
const COMMUNITY_SLOTS = 4;

const ads = [
  creative('gold', SponsorTier.Gold, ['https://api.daily.dev/px?id=gold']),
  ...PREMIUM.map((company) => creative(company, SponsorTier.Premium)),
  ...COMMUNITY.map((company) => creative(company, SponsorTier.Community)),
];

const logEvent = jest.fn();
const logEventStart = jest.fn();
const logEventEnd = jest.fn();

const LogContext = getLogContextStatic();

const renderStrip = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={
          {
            isAuthReady: true,
            user: { id: 'u1' },
          } as unknown as AuthContextData
        }
      >
        <LogContext.Provider
          value={
            {
              logEvent,
              logEventStart,
              logEventEnd,
              sendBeacon: jest.fn(),
            } as unknown as LogContextData
          }
        >
          <SponsorStrip config={config} headlines={headlines} />
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

/**
 * Lets the ad query settle before the row is asserted on. The strip runs on
 * fake timers for its rotation, so the query's promise has to be flushed by
 * hand rather than waited on.
 */
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    jest.advanceTimersByTime(1);
    await Promise.resolve();
  });
};

const shownLogos = (): string[] =>
  within(screen.getByTestId('sponsorStripRow'))
    .getAllByRole('link')
    .map((link) => link.getAttribute('title') as string);

const extraOf = (call: unknown[]): Record<string, unknown> =>
  JSON.parse((call[0] as { extra: string }).extra);

const callsFor = (action: AdActions) =>
  logEvent.mock.calls.filter(
    ([event]) => (event as { event_name: string }).event_name === action,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockFetch.mockResolvedValue(ads);
  headlines = [];
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width: WALL_WIDTH } as DOMRect);
});

afterEach(() => {
  jest.useRealTimers();
  document.documentElement.style.removeProperty('--sponsor-strip-height');
});

const setHeadlines = (next: PostHighlight[]) => {
  headlines = next;
};

const publishedHeight = (): string =>
  document.documentElement.style.getPropertyValue('--sponsor-strip-height');

it('should render the gold sponsor, four premium slots and the community row', async () => {
  renderStrip();
  await settle();

  const logos = shownLogos();

  expect(logos[0]).toEqual('gold');
  expect(logos.filter((company) => PREMIUM.includes(company))).toHaveLength(4);
  expect(logos.filter((company) => COMMUNITY.includes(company))).toHaveLength(
    COMMUNITY_SLOTS,
  );
});

it('should never rotate the gold sponsor', async () => {
  renderStrip();
  await settle();

  await act(async () => {
    jest.advanceTimersByTime(config.premiumRotationMs * 4);
  });

  expect(shownLogos()[0]).toEqual('gold');
});

it('should rotate a community slot without repeating a logo already on the row', async () => {
  renderStrip();
  await settle();

  const before = shownLogos();

  await act(async () => {
    jest.advanceTimersByTime(config.communityRotationMs);
  });

  const after = shownLogos();

  expect(after).not.toEqual(before);
  expect(new Set(after).size).toEqual(after.length);
});

it('should hold the premium row while the community row turns over', async () => {
  renderStrip();
  await settle();

  const premiumBefore = shownLogos().filter((company) =>
    PREMIUM.includes(company),
  );

  await act(async () => {
    jest.advanceTimersByTime(config.communityRotationMs);
  });

  expect(shownLogos().filter((company) => PREMIUM.includes(company))).toEqual(
    premiumBefore,
  );
});

it('should log an impression per logo with its tier and slot', async () => {
  renderStrip();
  await settle();

  const impressions = callsFor(AdActions.Impression);

  // Exactly one per mark on the row, and none for a mark the row trimmed: the
  // wall waits to be measured precisely so a creative it is about to drop
  // never bills an impression on its way through.
  expect(impressions).toHaveLength(shownLogos().length);
  expect(extraOf(impressions[0])).toEqual(
    expect.objectContaining({
      placement: 'footer_logo',
      tier: SponsorTier.Gold,
      slot_index: 0,
      gen_id: 'gen-gold',
    }),
  );
});

it('should open air time for every logo and close it when one rotates out', async () => {
  renderStrip();
  await settle();

  expect(logEventStart).toHaveBeenCalledTimes(shownLogos().length);
  expect(logEventStart.mock.calls[0][1]).toEqual(
    expect.objectContaining({ event_name: AdActions.AirTime }),
  );

  logEventEnd.mockClear();

  await act(async () => {
    jest.advanceTimersByTime(config.communityRotationMs);
  });

  expect(logEventEnd).toHaveBeenCalled();
  expect(logEventEnd.mock.calls[0][0]).toMatch(/^ss-\d+-gen-c\d$/);
});

it('should log a click with the logo that was clicked', async () => {
  renderStrip();
  await settle();

  fireEvent.click(screen.getByTitle('gold'));

  const clicks = callsFor(AdActions.Click);

  expect(clicks).toHaveLength(1);
  expect(extraOf(clicks[0])).toEqual(
    expect.objectContaining({ gen_id: 'gen-gold', slot_index: 0 }),
  );
});

it("should fire the ad server's impression pixel for a logo that carries one", async () => {
  renderStrip();
  await settle();

  const pixels = screen.getAllByTestId('pixel');

  expect(pixels).toHaveLength(1);
  expect(pixels[0]).toHaveAttribute('src', 'https://api.daily.dev/px?id=gold');
});

it('should carry the breaking news the feed no longer shows', async () => {
  setHeadlines([headline('h1'), headline('h2')]);
  renderStrip();
  await settle();

  const ticker = within(screen.getByTestId('sponsorStripHeadlines'));

  expect(ticker.getByText('Breaking news')).toBeInTheDocument();
  expect(ticker.getByText('Headline h1')).toBeInTheDocument();
  expect(ticker.getByText('Headline h2')).toBeInTheDocument();
});

it('should still carry the ticker when the ad server has no fill', async () => {
  mockFetch.mockResolvedValue([]);
  setHeadlines([headline('h1')]);
  renderStrip();
  await settle();

  // The feed's card is suppressed on the strip's behalf, so a strip with no
  // sponsors must not also drop the headlines.
  expect(screen.getByTestId('sponsorStripHeadlines')).toBeInTheDocument();
  expect(screen.queryByTestId('sponsorStripRow')).not.toBeInTheDocument();
});

it('should render nothing when it has neither sponsors nor headlines', async () => {
  mockFetch.mockResolvedValue([]);
  renderStrip();
  await settle();

  expect(screen.queryByTestId('sponsorStrip')).not.toBeInTheDocument();
});

it('should log a click on a headline with the headline that was clicked', async () => {
  setHeadlines([headline('h1'), headline('h2')]);
  renderStrip();
  await settle();

  fireEvent.click(screen.getByText('Headline h2'));

  const clicks = logEvent.mock.calls.filter(
    ([event]) =>
      (event as { event_name: string }).event_name === LogEvent.Click,
  );

  expect(extraOf(clicks[0])).toEqual(
    expect.objectContaining({ clicked_highlight_id: 'h2', position: 1 }),
  );
});

it('should publish its height so the floating controls can clear it', async () => {
  setHeadlines([headline('h1')]);
  renderStrip();
  await settle();

  // The sponsor row plus the ticker: the feedback pill and the scroll-to-top
  // button read this to lift out of the dock's way.
  expect(publishedHeight()).toEqual('72px');
});

it('should publish only the height of the row it actually renders', async () => {
  mockFetch.mockResolvedValue([]);
  setHeadlines([headline('h1')]);
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('32px');
});

it('should take the offset back when it has nothing to show', async () => {
  mockFetch.mockResolvedValue([]);
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('');
});

it('should take the offset back when it unmounts', async () => {
  setHeadlines([headline('h1')]);
  const { unmount } = renderStrip();
  await settle();
  unmount();

  expect(publishedHeight()).toEqual('');
});
