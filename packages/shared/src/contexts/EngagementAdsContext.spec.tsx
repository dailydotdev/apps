import React from 'react';
import type { ReactNode } from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import loggedUser from '../../__tests__/fixture/loggedUser';
import type { EngagementCreative } from '../lib/engagementAds';
import { gqlClient } from '../graphql/common';
import { ENGAGEMENT_CREATIVES_QUERY } from '../graphql/engagementAds';
import {
  EngagementAdsProvider,
  useEngagementAdsContext,
} from './EngagementAdsContext';

let mockIsProduction = false;
jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  get isProduction() {
    return mockIsProduction;
  },
}));

const mockCreative: EngagementCreative = {
  gen_id: 'creative-123',
  promoted_name: 'Test Brand',
  promoted_body: 'Test body text',
  promoted_cta: 'Try Now',
  promoted_url: 'https://example.com',
  promoted_logo_img: {
    dark: 'https://example.com/logo-dark.png',
    light: 'https://example.com/logo-light.png',
  },
  promoted_icon_img: {
    dark: 'https://example.com/icon-dark.png',
    light: 'https://example.com/icon-light.png',
  },
  promoted_gradient_start: { dark: '#6e40c9', light: '#5a32a3' },
  promoted_gradient_end: { dark: '#1f6feb', light: '#0969da' },
  tools: ['copilot', 'vscode'],
  keywords: ['AI', 'copilot'],
  tags: ['ai', 'copilot', 'machine-learning'],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient(defaultQueryClientTestingConfig);
  mockIsProduction = false;
  nock.cleanAll();
  jest.restoreAllMocks();
});

const createWrapper = (
  creatives?: EngagementCreative[],
  { isRemoteBootApplied = false, isPlus = false } = {},
) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TestBootProvider
        client={queryClient}
        auth={{ user: { ...loggedUser, isPlus } }}
      >
        <EngagementAdsProvider
          rawCreatives={creatives}
          isRemoteBootApplied={isRemoteBootApplied}
        >
          {children}
        </EngagementAdsProvider>
      </TestBootProvider>
    );
  };

const requestedCreatives = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(
    ([document]) => document === ENGAGEMENT_CREATIVES_QUERY,
  );

describe('EngagementAdsContext', () => {
  it('provides empty creatives when rawCreatives is undefined', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper(undefined),
    });

    expect(result.current.creatives).toEqual([]);
  });

  it('resolves themed values for the current theme', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    expect(result.current.creatives).toHaveLength(1);
    const [creative] = result.current.creatives;
    expect(creative.genId).toBe('creative-123');
    expect(creative.name).toBe('Test Brand');
    // TestBootProvider defaults to Dark theme
    expect(creative.logo).toBe('https://example.com/logo-dark.png');
    expect(creative.primaryColor).toBe('#6e40c9');
  });

  it('drops creatives whose urls fail validation', () => {
    const invalidCreative = {
      ...mockCreative,
      gen_id: 'creative-invalid',
      // eslint-disable-next-line no-script-url
      promoted_url: 'javascript:alert(1)',
    } as EngagementCreative;

    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative, invalidCreative]),
    });

    expect(result.current.creatives).toHaveLength(1);
    expect(result.current.creatives[0].genId).toBe('creative-123');
  });

  describe('getCreativeForTags', () => {
    it('returns a creative whose tags overlap', () => {
      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper([mockCreative]),
      });

      const found = result.current.getCreativeForTags(['copilot']);
      expect(found?.genId).toBe('creative-123');
    });

    it('returns null when no tags overlap', () => {
      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper([mockCreative]),
      });

      expect(result.current.getCreativeForTags(['golang', 'rust'])).toBeNull();
    });
  });

  describe('getCreativeForTool', () => {
    it('returns a creative whose tools list includes the tool name', () => {
      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper([mockCreative]),
      });

      expect(result.current.getCreativeForTool('VSCode')?.genId).toBe(
        'creative-123',
      );
    });

    it('returns null when tool name is missing or unmatched', () => {
      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper([mockCreative]),
      });

      expect(result.current.getCreativeForTool(null)).toBeNull();
      expect(result.current.getCreativeForTool('unknown-tool')).toBeNull();
    });
  });

  describe('deferred creatives', () => {
    afterEach(() => {
      document.cookie = 'euconsent-v2=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('fetches them with the stored consent once boot lands without them', async () => {
      document.cookie = 'euconsent-v2=CQoHJkAQoHJkAAfG';
      nock('http://localhost:3000')
        .post('/graphql', { query: ENGAGEMENT_CREATIVES_QUERY })
        .matchHeader('x-gdpr-consent', 'CQoHJkAQoHJkAAfG')
        .reply(200, { data: { engagementCreatives: [mockCreative] } });

      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper(undefined, { isRemoteBootApplied: true }),
      });

      await waitFor(() =>
        expect(result.current.getCreativeForTool('vscode')?.genId).toBe(
          'creative-123',
        ),
      );
    });

    it('does not fetch them before boot lands', () => {
      const spy = jest.spyOn(gqlClient, 'request');
      renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper(undefined),
      });

      expect(requestedCreatives(spy)).toHaveLength(0);
    });

    it('uses the inline boot creatives without fetching', () => {
      const spy = jest.spyOn(gqlClient, 'request');
      const { result } = renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper([], { isRemoteBootApplied: true }),
      });

      expect(result.current.creatives).toEqual([]);
      expect(requestedCreatives(spy)).toHaveLength(0);
    });

    it('does not fetch them for ad-free Plus in production', () => {
      mockIsProduction = true;
      const spy = jest.spyOn(gqlClient, 'request');
      renderHook(() => useEngagementAdsContext(), {
        wrapper: createWrapper(undefined, {
          isRemoteBootApplied: true,
          isPlus: true,
        }),
      });

      expect(requestedCreatives(spy)).toHaveLength(0);
    });
  });
});
