import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import type { StatuslineItem } from '../../../graphql/statusline';
import { AdActions } from '../../../lib/ads';
import { LogEvent } from '../../../lib/log';
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
let headlines: StatuslineItem[] = [];
let headlinesSettled = true;

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

const headline = (id: string): StatuslineItem => ({
  id,
  kind: 'HEADLINE',
  postId: `post-${id}`,
  title: `Headline ${id}`,
  upvotes: 0,
  permalink: `https://daily.dev/posts/${id}`,
  highlightedAt: new Date().toISOString(),
});

const popular = (id: string, upvotes = 42): StatuslineItem => ({
  id,
  kind: 'POST',
  postId: id,
  title: `Post ${id}`,
  upvotes,
  permalink: `https://daily.dev/posts/${id}`,
  highlightedAt: null,
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
          <SponsorStrip
            headlines={headlines}
            headlinesSettled={headlinesSettled}
          />
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
  headlinesSettled = true;
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width: WALL_WIDTH } as DOMRect);
});

afterEach(() => {
  jest.useRealTimers();
  document.documentElement.style.removeProperty('--sponsor-strip-height');
});

const setHeadlines = (next: StatuslineItem[]) => {
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

it('should open air time for every logo on the row', async () => {
  renderStrip();
  await settle();

  expect(logEventStart).toHaveBeenCalledTimes(shownLogos().length);
  expect(logEventStart.mock.calls[0][1]).toEqual(
    expect.objectContaining({ event_name: AdActions.AirTime }),
  );
  expect(logEventStart.mock.calls[0][0]).toMatch(/^ss-0-gen-gold$/);
});

it('should hold the same row for the life of the page', async () => {
  renderStrip();
  await settle();

  const before = shownLogos();

  // Turnover is per page load now, so nothing may swap under the reader —
  // and nothing may log a second impression for a slot that never changed.
  await act(async () => {
    jest.advanceTimersByTime(5 * 60_000);
  });

  expect(shownLogos()).toEqual(before);
  expect(callsFor(AdActions.Impression)).toHaveLength(before.length);
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

it('should carry the statusline mix in the ticker', async () => {
  setHeadlines([headline('h1'), popular('p1')]);
  renderStrip();
  await settle();

  const ticker = within(screen.getByTestId('sponsorStripHeadlines'));

  expect(ticker.getByText('Trending')).toBeInTheDocument();
  expect(ticker.getByText('Headline h1')).toBeInTheDocument();
  expect(ticker.getByText('Post p1')).toBeInTheDocument();
});

// Each kind carries the signal that means something for it, the way the
// terminal statusline does.
it('should show a timestamp for a headline and a score for a popular post', async () => {
  setHeadlines([headline('h1'), popular('p1', 42)]);
  renderStrip();
  await settle();

  const ticker = within(screen.getByTestId('sponsorStripHeadlines'));

  expect(ticker.getByText('Now')).toBeInTheDocument();
  expect(ticker.getByText('\u25b242')).toBeInTheDocument();
});

it('should leave a popular post with no score bare', async () => {
  setHeadlines([popular('p1', 0)]);
  renderStrip();
  await settle();

  const ticker = within(screen.getByTestId('sponsorStripHeadlines'));

  expect(ticker.getByText('Post p1')).toBeInTheDocument();
  expect(ticker.queryByText(/\u25b2/)).not.toBeInTheDocument();
});

it('should still carry the ticker when the ad server has no fill', async () => {
  mockFetch.mockResolvedValue([]);
  setHeadlines([headline('h1')]);
  renderStrip();
  await settle();

  // The two rows are independent: no ad fill must not also cost the reader
  // the ticker.
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

// Two independent round trips into a dock pinned to the viewport bottom: a row
// appearing underneath shoves the logos up, so both are held open until their
// query answers.
it('should hold the ticker row open before the headlines arrive', async () => {
  setHeadlines([]);
  headlinesSettled = false;
  renderStrip();
  await settle();

  expect(screen.getByTestId('sponsorStripHeadlines')).toBeInTheDocument();
  expect(publishedHeight()).toEqual('72px');
});

it('should hold the sponsor row open before the ad query answers', () => {
  setHeadlines([headline('h1')]);
  renderStrip();

  expect(screen.getByTestId('sponsorStripRow')).toBeInTheDocument();
  expect(publishedHeight()).toEqual('72px');
});

const tickerImpressions = () =>
  logEvent.mock.calls.filter(
    (call) =>
      (call[0] as { event_name: string }).event_name === LogEvent.Impression &&
      extraOf(call).feed === 'sponsor-strip-headlines',
  );

it('should log the ticker impression once the headlines arrive', async () => {
  setHeadlines([headline('h1'), headline('h2')]);
  renderStrip();
  await settle();

  expect(tickerImpressions()).toHaveLength(1);
  expect(extraOf(tickerImpressions()[0]).count).toEqual(2);
});

it('should not log a ticker impression while the row is still empty', async () => {
  setHeadlines([]);
  headlinesSettled = false;
  renderStrip();
  await settle();

  expect(tickerImpressions()).toHaveLength(0);
});

it('should collapse the reserved row once the query answers empty', async () => {
  setHeadlines([]);
  renderStrip();
  await settle();

  expect(screen.queryByTestId('sponsorStripHeadlines')).not.toBeInTheDocument();
  expect(publishedHeight()).toEqual('40px');
});
