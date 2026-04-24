import React from 'react';
import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import type { EngagementCreative } from '../lib/engagementAds';
import {
  EngagementAdsProvider,
  useEngagementAdsContext,
} from './EngagementAdsContext';

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
});

const createWrapper = (creatives?: EngagementCreative[]) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={creatives}>
          {children}
        </EngagementAdsProvider>
      </TestBootProvider>
    );
  };

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
});
