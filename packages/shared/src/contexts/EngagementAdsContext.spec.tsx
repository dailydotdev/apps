import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import type { EngagementCreative } from '../lib/engagementAds';
import { findCreativeForTags } from '../lib/engagementAds';
import {
  EngagementAdsProvider,
  useEngagementAdsContext,
} from './EngagementAdsContext';
import { LogExtraContextProvider, useLogExtraContext } from './LogExtraContext';
import type { LogEvent } from '../hooks/log/useLogQueue';

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
  promoted_background_img: {
    dark: 'https://example.com/bg-dark.png',
    light: 'https://example.com/bg-light.png',
  },
  promoted_icon_img: {
    dark: 'https://example.com/icon-dark.png',
    light: 'https://example.com/icon-light.png',
  },
  promoted_primary_color: { dark: '#6e40c9', light: '#5a32a3' },
  promoted_secondary_color: { dark: '#1f6feb', light: '#0969da' },
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
  it('should provide empty creatives when rawCreatives is undefined', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper(undefined),
    });

    expect(result.current.creatives).toEqual([]);
  });

  it('should resolve themed values for dark mode', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    expect(result.current.creatives).toHaveLength(1);

    const [creative] = result.current.creatives;
    expect(creative.genId).toBe('creative-123');
    expect(creative.name).toBe('Test Brand');
    expect(creative.body).toBe('Test body text');
    expect(creative.cta).toBe('Try Now');
    expect(creative.url).toBe('https://example.com');
    // Default theme in TestBootProvider is Dark
    expect(creative.logo).toBe('https://example.com/logo-dark.png');
    expect(creative.primaryColor).toBe('#6e40c9');
    expect(creative.secondaryColor).toBe('#1f6feb');
    expect(creative.tools).toEqual(['copilot', 'vscode']);
    expect(creative.keywords).toEqual(['AI', 'copilot']);
    expect(creative.tags).toEqual(['ai', 'copilot', 'machine-learning']);
  });

  it('should find creative for matching tags', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const found = result.current.getCreativeForTags(['copilot']);
    expect(found).not.toBeNull();
    expect(found?.genId).toBe('creative-123');
  });

  it('should return null from getCreativeForTags when no match', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const found = result.current.getCreativeForTags(['golang', 'rust']);
    expect(found).toBeNull();
  });
});

describe('gen_id via LogExtraContextProvider selector (post modal pattern)', () => {
  it('should inject gen_id when selector uses getCreativeForTags with matching tags', () => {
    function InnerComponent() {
      const ctx = useLogExtraContext();
      const result = ctx.selectorRef.current({
        event: { event_name: 'upvote' } as LogEvent,
      });
      return <div data-testid="extra">{result.extra ?? 'none'}</div>;
    }

    function PostModalSimulator() {
      const { getCreativeForTags } = useEngagementAdsContext();
      const postTags = ['ai', 'typescript'];

      return (
        <LogExtraContextProvider
          selector={() => {
            const creative = getCreativeForTags(postTags);
            return {
              referrer_target_id: 'post-1',
              ...(creative && { gen_id: creative.genId }),
            };
          }}
        >
          <InnerComponent />
        </LogExtraContextProvider>
      );
    }

    render(
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={[mockCreative]}>
          <PostModalSimulator />
        </EngagementAdsProvider>
      </TestBootProvider>,
    );

    const extra = JSON.parse(screen.getByTestId('extra').textContent);
    expect(extra.gen_id).toBe('creative-123');
    expect(extra.referrer_target_id).toBe('post-1');
  });

  it('should NOT inject gen_id when post tags do not match', () => {
    function InnerComponent() {
      const ctx = useLogExtraContext();
      const result = ctx.selectorRef.current({
        event: { event_name: 'upvote' } as LogEvent,
      });
      return <div data-testid="extra">{result.extra ?? 'none'}</div>;
    }

    function PostModalSimulator() {
      const { getCreativeForTags } = useEngagementAdsContext();
      const postTags = ['react', 'css'];

      return (
        <LogExtraContextProvider
          selector={() => {
            const creative = getCreativeForTags(postTags);
            return {
              referrer_target_id: 'post-2',
              ...(creative && { gen_id: creative.genId }),
            };
          }}
        >
          <InnerComponent />
        </LogExtraContextProvider>
      );
    }

    render(
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={[mockCreative]}>
          <PostModalSimulator />
        </EngagementAdsProvider>
      </TestBootProvider>,
    );

    const extra = JSON.parse(screen.getByTestId('extra').textContent);
    expect(extra.gen_id).toBeUndefined();
    expect(extra.referrer_target_id).toBe('post-2');
  });
});

describe('getCreativeForTags for feed vote events (useFeedVotePost pattern)', () => {
  it('should return gen_id for post with matching tags', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const postTags = ['ai', 'typescript'];
    const creative = result.current.getCreativeForTags(postTags);
    expect(creative).not.toBeNull();

    const extra: Record<string, unknown> = {
      origin: 'feed',
      feed: 'popular',
      ...(creative && { gen_id: creative.genId }),
    };

    expect(extra.gen_id).toBe('creative-123');
  });

  it('should not include gen_id for post without matching tags', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const postTags = ['react', 'css'];
    const creative = result.current.getCreativeForTags(postTags);
    expect(creative).toBeNull();

    const extra: Record<string, unknown> = {
      origin: 'feed',
      feed: 'popular',
      ...(creative && { gen_id: creative.genId }),
    };

    expect(extra.gen_id).toBeUndefined();
  });
});

describe('findCreativeForTags with feed items', () => {
  it('should match creative gen_id for a post with sponsored tags', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const { creatives } = result.current;
    expect(creatives).toHaveLength(1);

    const postTags = ['ai', 'typescript', 'react'];
    const creative = findCreativeForTags(creatives, postTags);
    expect(creative).not.toBeNull();
    expect(creative?.genId).toBe('creative-123');
  });

  it('should return null for a post without sponsored tags', () => {
    const { result } = renderHook(() => useEngagementAdsContext(), {
      wrapper: createWrapper([mockCreative]),
    });

    const { creatives } = result.current;
    const postTags = ['react', 'typescript', 'css'];
    const creative = findCreativeForTags(creatives, postTags);
    expect(creative).toBeNull();
  });

  it('should inject gen_id into extra data via selector pattern', () => {
    function InnerComponent() {
      const ctx = useLogExtraContext();
      const event = ctx.selectorRef.current({
        event: { event_name: 'upvote' } as LogEvent,
      });
      return <div data-testid="event-extra">{event.extra ?? 'none'}</div>;
    }

    function FeedItemSimulator() {
      const { creatives } = useEngagementAdsContext();
      const postTags = ['ai', 'typescript'];

      return (
        <LogExtraContextProvider
          selector={() => {
            const extraData: Record<string, unknown> = {};
            extraData.referrer_target_id = 'post-1';

            if (creatives.length > 0) {
              const creative = findCreativeForTags(creatives, postTags);
              if (creative) {
                extraData.gen_id = creative.genId;
              }
            }

            return extraData;
          }}
        >
          <InnerComponent />
        </LogExtraContextProvider>
      );
    }

    render(
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={[mockCreative]}>
          <FeedItemSimulator />
        </EngagementAdsProvider>
      </TestBootProvider>,
    );

    const el = screen.getByTestId('event-extra');
    const extra = JSON.parse(el.textContent);
    expect(extra.gen_id).toBe('creative-123');
    expect(extra.referrer_target_id).toBe('post-1');
  });

  it('should NOT inject gen_id when post tags do not match', () => {
    function InnerComponent() {
      const ctx = useLogExtraContext();
      const event = ctx.selectorRef.current({
        event: { event_name: 'upvote' } as LogEvent,
      });
      return <div data-testid="event-extra">{event.extra ?? 'none'}</div>;
    }

    function FeedItemSimulator() {
      const { creatives } = useEngagementAdsContext();
      const postTags = ['react', 'css'];

      return (
        <LogExtraContextProvider
          selector={() => {
            const extraData: Record<string, unknown> = {};
            extraData.referrer_target_id = 'post-2';

            if (creatives.length > 0) {
              const creative = findCreativeForTags(creatives, postTags);
              if (creative) {
                extraData.gen_id = creative.genId;
              }
            }

            return extraData;
          }}
        >
          <InnerComponent />
        </LogExtraContextProvider>
      );
    }

    render(
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={[mockCreative]}>
          <FeedItemSimulator />
        </EngagementAdsProvider>
      </TestBootProvider>,
    );

    const el = screen.getByTestId('event-extra');
    const extra = JSON.parse(el.textContent);
    expect(extra.gen_id).toBeUndefined();
    expect(extra.referrer_target_id).toBe('post-2');
  });
});
