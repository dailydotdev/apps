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
import { fetchSponsorStripAds } from './fetchSponsorStripAds';
import { SponsorTier } from './sponsorStripCreative';

jest.mock('./fetchSponsorStripAds', () => ({
  fetchSponsorStripAds: jest.fn(),
}));

const mockFetch = jest.mocked(fetchSponsorStripAds);
let headlines: StatuslineItem[] = [];
let headlinesSettled = true;

const advertiser = (company: string, pixels: string[] = []) => ({
  generation_id: `gen-${company}`,
  company_name: company,
  icon: `icon-${company}`,
  link: `https://daily.dev/${company}`,
  pixels,
});

// The tier is the group, not a field, so the fixture is the wire envelope
// rather than a flat list.
const bar = (groups: {
  pinned?: unknown[];
  top_tier?: unknown[];
  community?: unknown[];
}) => ({
  type: 'ADVERTISER_BAR',
  generation_id: 'bar-1',
  value: { advertiser_bar: groups },
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

const ads = bar({
  pinned: [advertiser('gold', ['https://api.daily.dev/px?id=gold'])],
  top_tier: PREMIUM.map((company) => advertiser(company)),
  community: COMMUNITY.map((company) => advertiser(company)),
});

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

// SLOT_WIDTH 88 + SLOT_GAP 16: floor((200 + 16) / 104) === 2 wall slots, fewer
// than the four premium marks the deck holds.
const NARROW_WALL_WIDTH = 200;
const NARROW_WALL_SLOTS = 2;

const setWallWidth = (width: number) =>
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width } as DOMRect);

// Gold sits outside the measured wall; premium and community share it.
const NARROW_TOTAL_LOGOS = NARROW_WALL_SLOTS + 1;

// The wall is overflow-hidden and a slot books its impression and opens its air
// time on mount, not on viewport — so a premium mark mounted past the fit would
// be paid-tier inventory logged as seen while clipped out of sight.
it('should not mount more premium slots than the measured wall fits', async () => {
  setWallWidth(NARROW_WALL_WIDTH);
  renderStrip();
  await settle();

  const logos = shownLogos();

  expect(logos.filter((company) => company === 'gold')).toHaveLength(1);
  expect(logos.filter((company) => PREMIUM.includes(company))).toHaveLength(
    NARROW_WALL_SLOTS,
  );
  // Premium already took the whole wall, so community gets nothing — the tier
  // order is what survives the squeeze, not the premium count.
  expect(logos.filter((company) => COMMUNITY.includes(company))).toHaveLength(
    0,
  );
});

it('should book no impression for a premium mark the wall cannot fit', async () => {
  setWallWidth(NARROW_WALL_WIDTH);
  renderStrip();
  await settle();

  expect(callsFor(AdActions.Impression)).toHaveLength(NARROW_TOTAL_LOGOS);
});

it('should open no air time for a premium mark the wall cannot fit', async () => {
  setWallWidth(NARROW_WALL_WIDTH);
  renderStrip();
  await settle();

  expect(logEventStart).toHaveBeenCalledTimes(NARROW_TOTAL_LOGOS);
});

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
      placement: 'advertiser_bar',
      tier: SponsorTier.Gold,
      slot_index: 0,
      gen_id: 'gen-gold',
    }),
  );
});

// The wire sends no dimensions, so every mark carries the stand-in ratio. A
// masked wall mark needs a box computed from it — a mask paints whatever box it
// gets — but the gold slot is an `<img>` with its own ratio, and handing it the
// stand-in width letterboxes a wide lockup to two thirds of the height the row
// reserves for the one slot somebody paid for.
it('should let the gold mark take its own width', async () => {
  renderStrip();
  await settle();

  // By alt text, not role: the slot also renders the ad server's pixel, which
  // is an image too.
  const gold = within(screen.getByTitle('gold')).getByAltText('gold');

  expect(gold).toHaveStyle({ height: '20px', width: 'auto' });
});

it('should give a masked wall mark a box to paint into', async () => {
  renderStrip();
  await settle();

  // Whichever premium mark the deck dealt, not a named one: the pool is
  // shuffled per page load and holds more creatives than the row has slots,
  // so naming one picks a mark that is only usually there.
  const company = shownLogos().find((name) => PREMIUM.includes(name)) as string;
  const wall = within(screen.getByTitle(company)).getByLabelText(company);

  expect(wall).toHaveStyle({ height: '17px', width: '60px' });
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

it('should carry the popular posts in the ticker', async () => {
  setHeadlines([popular('p1'), popular('p2')]);
  renderStrip();
  await settle();

  const ticker = within(screen.getByTestId('sponsorStripHeadlines'));

  expect(ticker.getByText('Trending')).toBeInTheDocument();
  expect(ticker.getByText('Post p1')).toBeInTheDocument();
  expect(ticker.getByText('Post p2')).toBeInTheDocument();
});

it('should show the score that got a post into the row', async () => {
  setHeadlines([popular('p1', 42)]);
  renderStrip();
  await settle();

  expect(
    within(screen.getByTestId('sponsorStripHeadlines')).getByText('\u25b242'),
  ).toBeInTheDocument();
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
  mockFetch.mockResolvedValue(bar({}));
  setHeadlines([popular('p1')]);
  renderStrip();
  await settle();

  // The two rows are independent: no ad fill must not also cost the reader
  // the ticker.
  expect(screen.getByTestId('sponsorStripHeadlines')).toBeInTheDocument();
  expect(screen.queryByTestId('sponsorStripRow')).not.toBeInTheDocument();
});

it('should render nothing when it has neither sponsors nor headlines', async () => {
  mockFetch.mockResolvedValue(bar({}));
  renderStrip();
  await settle();

  expect(screen.queryByTestId('sponsorStrip')).not.toBeInTheDocument();
});

const tickerClicks = () =>
  logEvent.mock.calls.filter(
    ([event]) =>
      (event as { event_name: string }).event_name === LogEvent.Click,
  );

// The row carries no highlights, so a post id must never reach
// `clicked_highlight_id` — anything joining that field against the highlights
// table would mis-join rather than come back empty.
it('should log a click on a post without a highlight id', async () => {
  setHeadlines([popular('p1'), popular('p2')]);
  renderStrip();
  await settle();

  fireEvent.click(screen.getByText('Post p2'));

  const extra = extraOf(tickerClicks()[0]);

  expect(extra).toEqual(
    expect.objectContaining({ post_id: 'p2', position: 1 }),
  );
  expect(extra).not.toHaveProperty('clicked_highlight_id');
});

it('should log the impression with post ids only', async () => {
  setHeadlines([popular('p1'), popular('p2')]);
  renderStrip();
  await settle();

  const impression = logEvent.mock.calls.find(
    ([event]) =>
      (event as { event_name: string }).event_name === LogEvent.Impression &&
      extraOf([event]).feed === 'sponsor-strip-headlines',
  );
  const extra = extraOf(impression);

  expect(extra).toEqual(
    expect.objectContaining({ post_ids: ['p1', 'p2'], count: 2 }),
  );
  expect(extra).not.toHaveProperty('highlight_ids');
});

it('should send a ticker row to its post permalink', async () => {
  setHeadlines([popular('p1')]);
  renderStrip();
  await settle();

  expect(
    within(screen.getByTestId('sponsorStripHeadlines'))
      .getByText('Post p1')
      .closest('a'),
  ).toHaveAttribute('href', 'https://daily.dev/posts/p1');
});

it('should publish its height so the floating controls can clear it', async () => {
  setHeadlines([popular('p1')]);
  renderStrip();
  await settle();

  // The sponsor row plus the ticker: the feedback pill and the scroll-to-top
  // button read this to lift out of the dock's way.
  expect(publishedHeight()).toEqual('72px');
});

it('should publish only the height of the row it actually renders', async () => {
  mockFetch.mockResolvedValue(bar({}));
  setHeadlines([popular('p1')]);
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('32px');
});

it('should take the offset back when it has nothing to show', async () => {
  mockFetch.mockResolvedValue(bar({}));
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('');
});

it('should take the offset back when it unmounts', async () => {
  setHeadlines([popular('p1')]);
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
  setHeadlines([popular('p1')]);
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

it('should log the ticker impression once the rows arrive', async () => {
  setHeadlines([popular('p1'), popular('p2')]);
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
