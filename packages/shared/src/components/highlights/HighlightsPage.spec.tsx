import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { HighlightsPage } from './HighlightsPage';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import {
  HIGHLIGHTS_PAGE_QUERY,
  MAJOR_HEADLINES_MAX_FIRST,
  POST_HIGHLIGHTS_FEED_QUERY,
} from '../../graphql/highlights';
import {
  featureSharingVisibility,
  featureShareHappeningNow,
} from '../../lib/featureManagement';

const PAGE_SHARE_LABEL = 'Share Happening Now';
const TOPIC_SHARE_LABEL = 'Copy link to AI agents';
const ITEM_SHARE_LABEL = 'Copy link to this highlight';

const summary = 'A concise summary for the expanded highlight item.';

const highlightNode = (id: string) => ({
  id,
  channel: 'agents',
  headline: `Headline ${id}`,
  highlightedAt: '2026-04-05T09:00:00.000Z',
  significance: 'major',
  post: {
    id: `post-${id}`,
    type: 'article',
    commentsPermalink: `/posts/post-${id}`,
    summary,
  },
});

const channelConfiguration = {
  channel: 'agents',
  displayName: 'AI agents',
  digest: {
    frequency: 'daily',
    source: {
      id: 'source-1',
      name: 'AI agents',
      image: 'https://daily.dev/image.jpg',
      handle: 'ai-agents',
      permalink: 'https://daily.dev/sources/ai-agents',
    },
  },
};

const mockPageQuery = () =>
  mockGraphQL({
    request: {
      query: HIGHLIGHTS_PAGE_QUERY,
      variables: { first: MAJOR_HEADLINES_MAX_FIRST },
    },
    result: {
      data: {
        majorHeadlines: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: [{ node: highlightNode('h1') }],
        },
        channelConfigurations: [channelConfiguration],
      },
    },
  });

const mockChannelQuery = () =>
  mockGraphQL({
    request: {
      query: POST_HIGHLIGHTS_FEED_QUERY,
      variables: { channel: 'agents' },
    },
    result: {
      data: { postHighlights: [highlightNode('h1'), highlightNode('h2')] },
    },
  });

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: jest.fn(),
  });
});

const getGrowthBook = (enabled: boolean): GrowthBook => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSharingVisibility.id]: { defaultValue: enabled },
    [featureShareHappeningNow.id]: { defaultValue: enabled },
  });

  return gb;
};

const renderChannelTab = (enabled: boolean): RenderResult => {
  (useRouter as jest.Mock).mockReturnValue({
    query: { channel: 'agents', highlight: 'h1' },
    pathname: '/highlights/[channel]',
    push: jest.fn(),
    asPath: '/highlights/agents',
  } as unknown as NextRouter);

  mockPageQuery();
  mockChannelQuery();

  return render(
    <TestBootProvider
      client={new QueryClient()}
      gb={getGrowthBook(enabled)}
      auth={{ isLoggedIn: false, user: undefined }}
    >
      <HighlightsPage />
    </TestBootProvider>,
  );
};

describe('HighlightsPage sharing', () => {
  it('should render no share controls when the flag is off', async () => {
    renderChannelTab(false);

    expect(await screen.findByText(summary)).toBeInTheDocument();
    expect(screen.queryByLabelText(PAGE_SHARE_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(TOPIC_SHARE_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ITEM_SHARE_LABEL)).not.toBeInTheDocument();
  });

  it('should render exactly one control per level when enabled', async () => {
    renderChannelTab(true);

    // Only the route-expanded highlight exposes an item-level control, so the
    // three levels never stack up into a row of share buttons.
    expect(await screen.findByText(summary)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByLabelText(PAGE_SHARE_LABEL)).toHaveLength(1),
    );
    expect(screen.getAllByLabelText(TOPIC_SHARE_LABEL)).toHaveLength(1);
    expect(screen.getAllByLabelText(ITEM_SHARE_LABEL)).toHaveLength(1);
  });
});
