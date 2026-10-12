import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { AdActions } from '../../../lib/ads';
import { SponsorStrip } from './SponsorStrip';
import { fetchSponsorStripAds } from './fetchSponsorStripAds';
import { SponsorTier } from './sponsorStripCreative';
import {
  NARROW_SLOT_GAP,
  SLOT_GAP,
  WALL_MAX_WIDTH,
  WIDE_SLOT_GAP_MAX,
  WIDE_WALL_WIDTH,
} from './sponsorLogoSizing';

jest.mock('./fetchSponsorStripAds', () => ({
  fetchSponsorStripAds: jest.fn(),
}));

jest.mock('../../../hooks/utils/useThemedAsset', () => ({
  useIsLightTheme: () => false,
}));

const mockFetch = jest.mocked(fetchSponsorStripAds);

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

const PREMIUM = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const COMMUNITY = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];

// Wide enough for eight wall slots — four premium, four community — which
// leaves the community deck bigger than the row it fills, the only state in
// which a rotation has anywhere to go.
const WALL_WIDTH = WALL_MAX_WIDTH * 8 + SLOT_GAP * 7;
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
          <SponsorStrip />
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
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width: WALL_WIDTH } as DOMRect);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  document.documentElement.style.removeProperty('--sponsor-strip-height');
});

const publishedHeight = (): string =>
  document.documentElement.style.getPropertyValue('--sponsor-strip-height');

// Fewer slots than the four premium marks the deck holds. A wall this
// narrow is fitted with the tablet pair, whose minimum is NARROW_SLOT_GAP.
const NARROW_WALL_SLOTS = 2;
const NARROW_WALL_WIDTH =
  WALL_MAX_WIDTH * NARROW_WALL_SLOTS +
  NARROW_SLOT_GAP * (NARROW_WALL_SLOTS - 1);

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

  expect(gold).toHaveStyle({ height: '18px', width: 'auto' });
});

it('should give a masked wall mark a box to paint into', async () => {
  renderStrip();
  await settle();

  // Whichever premium mark the deck dealt, not a named one: the pool is
  // shuffled per page load and holds more creatives than the row has slots,
  // so naming one picks a mark that is only usually there.
  const company = shownLogos().find((name) => PREMIUM.includes(name)) as string;
  const wall = within(screen.getByTitle(company)).getByLabelText(company);

  expect(wall).toHaveStyle({ height: '16px', width: '56px' });
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

it('should render only the sponsor row', async () => {
  renderStrip();
  await settle();

  const strip = screen.getByTestId('sponsorStrip');
  expect(within(strip).getByTestId('sponsorStripRow')).toBeInTheDocument();
  expect(strip.children).toHaveLength(1);
});

it('should render nothing when it has no sponsors', async () => {
  mockFetch.mockResolvedValue(bar({}));
  renderStrip();
  await settle();

  expect(screen.queryByTestId('sponsorStrip')).not.toBeInTheDocument();
});

it('should publish its height so the floating controls can clear it', async () => {
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('40px');
});

it('should take the offset back when it has nothing to show', async () => {
  mockFetch.mockResolvedValue(bar({}));
  renderStrip();
  await settle();

  expect(publishedHeight()).toEqual('');
});

it('should take the offset back when it unmounts', async () => {
  const { unmount } = renderStrip();
  await settle();
  unmount();

  expect(publishedHeight()).toEqual('');
});

it('should hold the sponsor row open before the ad query answers', () => {
  renderStrip();

  expect(screen.getByTestId('sponsorStripRow')).toBeInTheDocument();
  expect(publishedHeight()).toEqual('40px');
});

// The bar opens on the same column whatever the ad server returns, so an
// unsold gold slot cannot change its shape under the feed.
it('should credit the row with no gold mark on it', async () => {
  mockFetch.mockResolvedValue(
    bar({ top_tier: PREMIUM.map((company) => advertiser(company)) }),
  );
  renderStrip();
  await settle();

  const row = within(screen.getByTestId('sponsorStripRow'));
  expect(row.getByText('Made possible by')).toBeInTheDocument();
  expect(row.queryByTitle('gold')).not.toBeInTheDocument();
});

it('should carry the credit on a row still held open for the ad query', () => {
  renderStrip();

  expect(
    within(screen.getByTestId('sponsorStripRow')).getByText('Made possible by'),
  ).toBeInTheDocument();
});

const mockLogoImages = () => {
  const images: HTMLImageElement[] = [];
  jest.spyOn(window, 'Image').mockImplementation(() => {
    const image = document.createElement('img');
    images.push(image);
    return image;
  });
  return images;
};

const loadLogos = (images: HTMLImageElement[], ratio: number) => {
  act(() => {
    images.forEach((image) => {
      Object.defineProperties(image, {
        naturalWidth: { value: ratio * 100 },
        naturalHeight: { value: 100 },
      });
      image.dispatchEvent(new Event('load'));
    });
  });
};

it('should fill unused row space after measuring all candidates without logging hidden ads', async () => {
  const images = mockLogoImages();
  // Exactly twelve 2:1 marks (32px) at the minimum gap. Unmeasured, every
  // mark is budgeted at the maximum width, so only six fit.
  setWallWidth(32 * 12 + SLOT_GAP * 11);
  renderStrip();
  await settle();

  expect(shownLogos()).toHaveLength(7);
  expect(callsFor(AdActions.Impression)).toHaveLength(7);
  expect(images).toHaveLength(4 + COMMUNITY.length);

  loadLogos(images, 2);
  await settle();

  const logos = shownLogos();
  expect(logos.filter((company) => PREMIUM.includes(company))).toHaveLength(4);
  expect(logos.filter((company) => COMMUNITY.includes(company))).toHaveLength(
    8,
  );
  expect(callsFor(AdActions.Impression)).toHaveLength(13);
  expect(logEventStart).toHaveBeenCalledTimes(13);
});

it('should open the gap to a wide row\u2019s pair without re-fitting after mount', async () => {
  const images = mockLogoImages();
  setWallWidth(WIDE_WALL_WIDTH);
  renderStrip();
  await settle();
  loadLogos(images, 2);
  await settle();

  // Every mark in the deck fits with room to spare, so the gap sits at the
  // wide ceiling rather than spreading to fill the row.
  expect(shownLogos()).toHaveLength(1 + 4 + COMMUNITY.length);
  expect(callsFor(AdActions.Impression)).toHaveLength(1 + 4 + COMMUNITY.length);
  const wall = screen.getByTestId('sponsorStripRow').lastElementChild;
  expect(wall).toHaveStyle({ gap: `${WIDE_SLOT_GAP_MAX}px` });
});

it('should fit measured logos on a row narrower than the maximum logo width', async () => {
  const images = mockLogoImages();
  // Two square marks and the tablet gap between them, inside one maximum
  // width (a wall this narrow is fitted with the narrow pair).
  setWallWidth(16 * 2 + NARROW_SLOT_GAP);
  renderStrip();
  await settle();

  expect(shownLogos()).toEqual(['gold']);
  loadLogos(images, 1);
  await settle();

  expect(shownLogos()).toHaveLength(3);
  expect(callsFor(AdActions.Impression)).toHaveLength(3);
});
