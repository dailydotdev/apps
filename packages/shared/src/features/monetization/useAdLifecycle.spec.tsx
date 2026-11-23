import type { ReactNode } from 'react';
import React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ad from '../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { Ad } from '../../graphql/posts';
import { AdPlacement } from '../../lib/ads';
import { FeaturesReadyContext } from '../../components/GrowthBookProvider';
import { AdPixel } from '../../components/cards/ad/common/AdPixel';
import { AdSlot } from '../../components/cards/ad/common/AdSlot';
import { useFetchAd } from './useFetchAd';
import { useAdQuery } from './useAdQuery';
import { useAdMacroContext } from './useAdMacroContext';
import { useSponsorStripAds } from './sponsorStrip/useSponsorStripAds';

jest.mock('./useAdPageViewId', () => ({ useAdPageViewId: () => 'page-view' }));
jest.mock('./useAdRequestConsent', () => ({
  useAdRequestConsent: () => ({ gdprApplies: false }),
}));
jest.mock('./useAdMacroContext', () => ({ useAdMacroContext: jest.fn() }));
jest.mock('./browserClientHints', () => ({
  getBrowserClientHints: async () => undefined,
}));

const originalFetch = global.fetch;
let client: QueryClient;
let gb: GrowthBook;
let creative: Ad;
let generation = 0;

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider client={client} gb={gb}>
    {children}
  </TestBootProvider>
);

const setLifecycleEnabled = (enabled: boolean) =>
  act(() => gb.setFeatures({ ad_slot_lifecycle: { defaultValue: enabled } }));

const sponsorPool = () =>
  Array.from({ length: 8 }, (_, index) => ({
    generation_id: `pool-${generation}-${index}`,
    company_name: `Sponsor ${index}`,
    icon: `https://images.example/${index}.svg`,
    link: `https://advertiser.example/${index}`,
    pixels: ['https://tracking.example/impression'],
    lifecycle: {
      version: 1,
      on: {
        'post-fetch': [
          { type: 'pixel', url: `https://tracking.example/fetched-${index}` },
        ],
      },
    },
  }));

beforeEach(() => {
  generation += 1;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  gb = new GrowthBook();
  creative = {
    ...ad,
    generationId: `lifecycle-hooks-${generation}`,
    pixel: ['https://tracking.example/legacy-impression'],
    lifecycle: {
      version: 1,
      on: {
        'post-fetch': [
          { type: 'pixel', url: 'https://tracking.example/fetched' },
        ],
      },
    },
  };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [creative],
    headers: { get: () => creative.generationId },
  });
  jest.mocked(useAdMacroContext).mockReturnValue({ gdprApplies: false });
});

afterEach(() => {
  client.clear();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

it.each([false, true])(
  'gates fetch actions and returned ads with lifecycle=%s',
  async (enabled) => {
    gb.setFeatures({ ad_slot_lifecycle: { defaultValue: enabled } });
    const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
    const onTransition = jest.fn();
    const { result } = renderHook(() => useFetchAd(), { wrapper });
    const fetched = await result.current.fetchAd({ onTransition });

    expect(fetched?.lifecycle).toEqual(
      enabled ? creative.lifecycle : undefined,
    );
    expect(fetched?.pixel).toEqual(creative.pixel);
    expect(onTransition).toHaveBeenLastCalledWith({
      type: 'post-fetch',
      ad: fetched,
    });
    expect(src.mock.calls).toEqual(
      enabled ? [['https://tracking.example/fetched']] : [],
    );
    expect(creative.lifecycle).toBeDefined();
  },
);

it.each([false, true])(
  'filters single-slot reads while retaining cached lifecycle with lifecycle=%s',
  async (enabled) => {
    gb.setFeatures({ ad_slot_lifecycle: { defaultValue: enabled } });
    const { result } = renderHook(
      () =>
        useAdQuery({
          placement: AdPlacement.Feed,
          queryKey: ['review-ad'],
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.lifecycle).toEqual(
      enabled ? creative.lifecycle : undefined,
    );
    const cached = client
      .getQueryCache()
      .getAll()
      .find((query) => query.queryKey[0] === 'review-ad')?.state.data as Ad;
    expect(cached.lifecycle).toEqual(creative.lifecycle);
    expect(cached.pixel).toEqual(creative.pixel);
  },
);

it('keeps fetching legacy ads while feature flags have not resolved', async () => {
  const pendingWrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} gb={gb}>
      <FeaturesReadyContext.Provider
        value={{
          ready: false,
          settled: true,
          getFeatureValue: jest.fn(),
        }}
      >
        {children}
      </FeaturesReadyContext.Provider>
    </TestBootProvider>
  );
  const { result } = renderHook(
    () =>
      useAdQuery({
        placement: AdPlacement.Feed,
        queryKey: ['pending-flags-ad'],
      }),
    { wrapper: pendingWrapper },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.pixel).toEqual(creative.pixel);
  expect(result.current.data?.lifecycle).toBeUndefined();
});

it('applies resolved and toggled flags to the same cached creative without refetching', async () => {
  let ready = false;
  gb.setFeatures({ ad_slot_lifecycle: { defaultValue: true } });
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const pendingWrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} gb={gb}>
      <FeaturesReadyContext.Provider
        value={{ ready, settled: ready, getFeatureValue: jest.fn() }}
      >
        {children}
      </FeaturesReadyContext.Provider>
    </TestBootProvider>
  );
  const { result, rerender } = renderHook(
    () => useAdQuery({ placement: AdPlacement.Feed, queryKey: ['flag-ad'] }),
    { wrapper: pendingWrapper },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.lifecycle).toBeUndefined();

  ready = true;
  rerender();
  await waitFor(() =>
    expect(result.current.data?.lifecycle).toEqual(creative.lifecycle),
  );
  setLifecycleEnabled(false);
  rerender();
  expect(result.current.data?.lifecycle).toBeUndefined();
  setLifecycleEnabled(true);
  rerender();
  expect(result.current.data?.lifecycle).toEqual(creative.lifecycle);
  expect(result.current.data?.generationId).toBe(creative.generationId);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(src).not.toHaveBeenCalled();
});

it('keeps the mounted card and impression image when lifecycle configuration appears or disappears', async () => {
  creative.lifecycle = {
    version: 1,
    on: {
      impression: creative.pixel?.map((url) => ({ type: 'pixel', url })),
      click: [{ type: 'pixel', url: 'https://tracking.example/click' }],
    },
  };
  const Slot = () => {
    const { data } = useAdQuery({
      placement: AdPlacement.Feed,
      queryKey: ['mounted-flag-ad'],
    });
    return data ? (
      <AdSlot ad={data}>
        {(slotProps) => (
          <article {...slotProps} data-testid="creative">
            <AdPixel ad={data} />
          </article>
        )}
      </AdSlot>
    ) : null;
  };
  const { rerender } = render(<Slot />, { wrapper });
  const pixel = await screen.findByTestId('pixel');
  const root = screen.getByTestId('creative');
  const source = pixel.getAttribute('src');
  for (const enabled of [true, false, true]) {
    setLifecycleEnabled(enabled);
    rerender(<Slot />);
    expect(screen.getByTestId('creative')).toBe(root);
    expect(screen.getByTestId('pixel')).toBe(pixel);
    expect(pixel).toHaveAttribute('src', source);
  }
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

it('retries a transient initial failure instead of caching no fill', async () => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: 1, retryDelay: 0 } },
  });
  jest.mocked(global.fetch).mockResolvedValueOnce({
    ok: false,
    status: 503,
    json: async () => {
      throw new SyntaxError('Unexpected token <');
    },
  } as unknown as Response);
  const { result } = renderHook(
    () =>
      useAdQuery({
        placement: AdPlacement.Feed,
        queryKey: ['retry-ad'],
      }),
    { wrapper },
  );
  await waitFor(() =>
    expect(result.current.data?.generationId).toBe(creative.generationId),
  );
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

it.each([false, true])(
  'gates pool post-fetch actions and retains cached metadata with lifecycle=%s',
  async (enabled) => {
    gb.setFeatures({ ad_slot_lifecycle: { defaultValue: enabled } });
    const pool = sponsorPool();
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ value: { advertiser_bar: { community: pool } } }),
    } as Response);
    const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
    const { result } = renderHook(() => useSponsorStripAds(), { wrapper });
    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(result.current.community).toHaveLength(0);

    const cached = client
      .getQueryCache()
      .getAll()
      .find((query) => query.queryKey.includes(AdPlacement.SponsorStrip))?.state
      .data as Array<{ lifecycle?: unknown }>;
    expect(cached).toHaveLength(pool.length);
    expect(cached.every((item) => !!item.lifecycle)).toBe(true);
    const pixels = src.mock.calls
      .map(([url]) => url)
      .filter((url) => url.startsWith('https://tracking.example/fetched-'));
    expect(pixels).toHaveLength(enabled ? pool.length : 0);
  },
);

it('keeps the sponsor deal and request while flag changes update every dealt creative', async () => {
  const pool = sponsorPool();
  jest.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ value: { advertiser_bar: { community: pool } } }),
  } as Response);
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width: 4_000 } as DOMRect);
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const { result, rerender } = renderHook(() => useSponsorStripAds(), {
    wrapper,
  });
  act(() => result.current.wallRef(document.createElement('div')));
  await waitFor(() =>
    expect(result.current.community).toHaveLength(pool.length),
  );
  const order = result.current.community.map(({ genId }) => genId);
  expect(result.current.community.every((item) => !item.lifecycle)).toBe(true);

  for (const enabled of [true, false, true]) {
    setLifecycleEnabled(enabled);
    rerender();
    expect(result.current.community.map(({ genId }) => genId)).toEqual(order);
    expect(
      result.current.community.every((item) => !!item.lifecycle === enabled),
    ).toBe(true);
  }
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(
    src.mock.calls.filter(([url]) =>
      url.startsWith('https://tracking.example/'),
    ),
  ).toHaveLength(0);
});
