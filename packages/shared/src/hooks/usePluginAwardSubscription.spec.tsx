import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePluginAwardSubscription } from './usePluginAwardSubscription';
import { useAuthContext } from '../contexts/AuthContext';
import type { AwardProps, FeaturedAward } from '../graphql/njord';
import { getProductsQueryOptions } from '../graphql/njord';
import type { Plugin } from '../graphql/plugins';
import { pluginQueryOptions, pluginsQueryOptions } from '../graphql/plugins';
import { defaultQueryClientConfig } from '../lib/query';

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const user = { id: 'u1' };

const products: (FeaturedAward & { id: string })[] = [
  { id: 'cheap', name: 'Cheap', image: 'cheap.png', value: 10 },
  { id: 'pricey', name: 'Pricey', image: 'pricey.png', value: 500 },
];

const createPlugin = (props: Partial<Plugin> = {}): Plugin =>
  ({
    id: 'pl1',
    name: 'Plugin',
    numAwards: 0,
    awarded: false,
    featuredAward: null,
    ...props,
  } as Plugin);

let client: QueryClient;

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const award = async (variables: AwardProps) => {
  await act(() =>
    client
      .getMutationCache()
      .build(client, {
        mutationKey: ['awards', variables],
        mutationFn: async () => ({}),
      })
      .execute(variables),
  );
};

const getPlugin = () =>
  client.getQueryData<Plugin>(pluginQueryOptions('pl1', user).queryKey);

describe('usePluginAwardSubscription', () => {
  beforeEach(() => {
    jest.mocked(useAuthContext).mockReturnValue({ user } as never);
    client = new QueryClient(defaultQueryClientConfig);
    client.setQueryData(getProductsQueryOptions().queryKey, {
      edges: products.map((node) => ({ node })),
    });
  });

  it('marks the plugin awarded and bumps the count in the detail and list caches', async () => {
    client.setQueryData(
      pluginQueryOptions('pl1', user).queryKey,
      createPlugin(),
    );
    client.setQueryData(pluginsQueryOptions(undefined, user).queryKey, [
      createPlugin(),
      createPlugin({ id: 'pl2' }),
    ]);
    renderHook(() => usePluginAwardSubscription('pl1'), { wrapper });

    await award({ productId: 'cheap', type: 'PLUGIN', entityId: 'pl1' });

    expect(getPlugin()).toMatchObject({
      awarded: true,
      numAwards: 1,
      featuredAward: { award: { name: 'Cheap', value: 10 } },
    });
    expect(
      client.getQueryData<Plugin[]>(
        pluginsQueryOptions(undefined, user).queryKey,
      ),
    ).toMatchObject([
      { id: 'pl1', awarded: true, numAwards: 1 },
      { id: 'pl2', awarded: false, numAwards: 0 },
    ]);
  });

  it('keeps a more valuable featured award', async () => {
    client.setQueryData(
      pluginQueryOptions('pl1', user).queryKey,
      createPlugin({
        numAwards: 1,
        featuredAward: { award: products[1] },
      }),
    );
    renderHook(() => usePluginAwardSubscription('pl1'), { wrapper });

    await award({ productId: 'cheap', type: 'PLUGIN', entityId: 'pl1' });

    expect(getPlugin()).toMatchObject({
      numAwards: 2,
      featuredAward: { award: { name: 'Pricey', value: 500 } },
    });
  });

  it('replaces the featured award with a more valuable one', async () => {
    client.setQueryData(
      pluginQueryOptions('pl1', user).queryKey,
      createPlugin({
        numAwards: 1,
        featuredAward: { award: products[0] },
      }),
    );
    renderHook(() => usePluginAwardSubscription('pl1'), { wrapper });

    await award({ productId: 'pricey', type: 'PLUGIN', entityId: 'pl1' });

    expect(getPlugin()?.featuredAward?.award).toMatchObject({
      name: 'Pricey',
      value: 500,
    });
  });

  it('ignores awards for other plugins and other award types', async () => {
    client.setQueryData(
      pluginQueryOptions('pl1', user).queryKey,
      createPlugin(),
    );
    renderHook(() => usePluginAwardSubscription('pl1'), { wrapper });

    await award({ productId: 'cheap', type: 'PLUGIN', entityId: 'pl2' });
    await award({ productId: 'cheap', type: 'POST', entityId: 'pl1' });

    expect(getPlugin()).toMatchObject({ awarded: false, numAwards: 0 });
  });
});
