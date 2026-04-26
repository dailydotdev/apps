import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HighlightPostSidebarWidget } from './HighlightPostSidebarWidget';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useLogContext } from '../../../contexts/LogContext';
import { gqlClient } from '../../../graphql/common';

jest.mock('../../../lib/constants', () => ({
  webappUrl: '/',
  isDevelopment: false,
}));

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../hooks/useConditionalFeature');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../graphql/common', () => ({
  gqlClient: {
    request: jest.fn(),
  },
}));

const mockUseAuthContext = jest.mocked(useAuthContext);
const mockUseConditionalFeature = jest.mocked(useConditionalFeature);
const mockUseLogContext = jest.mocked(useLogContext);
const mockGqlRequest = jest.mocked(gqlClient.request);

const buildHighlight = (id: string, headline: string) => ({
  id,
  channel: 'agents',
  headline,
  highlightedAt: '2026-04-05T09:00:00.000Z',
  post: {
    id: `post-${id}`,
    commentsPermalink: `/posts/post-${id}`,
  },
});

const buildResponse = (highlights: ReturnType<typeof buildHighlight>[]) => ({
  majorHeadlines: {
    edges: highlights.map((node) => ({ node, cursor: node.id })),
    pageInfo: { hasNextPage: false, endCursor: null },
  },
});

const renderWidget = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HighlightPostSidebarWidget />
    </QueryClientProvider>,
  );
};

describe('HighlightPostSidebarWidget', () => {
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGqlRequest.mockReset();
    mockUseAuthContext.mockReturnValue({
      user: { id: 'u1' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
    mockUseLogContext.mockReturnValue({
      logEvent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title and the first headline when query resolves', async () => {
    mockGqlRequest.mockResolvedValue(
      buildResponse([
        buildHighlight('h1', 'The first highlight'),
        buildHighlight('h2', 'The second highlight'),
      ]),
    );

    renderWidget();

    expect(await screen.findByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.queryByText('The second highlight')).not.toBeInTheDocument();
  });

  it('returns null when no highlights are returned', async () => {
    mockGqlRequest.mockResolvedValue(buildResponse([]));

    renderWidget();

    await waitFor(() => expect(mockGqlRequest).toHaveBeenCalled());
    expect(screen.queryByText('Happening Now')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('postPageHighlightWidget'),
    ).not.toBeInTheDocument();
  });

  it('returns null when feature flag is off', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
    mockGqlRequest.mockResolvedValue(
      buildResponse([buildHighlight('h1', 'Hidden headline')]),
    );

    renderWidget();

    expect(screen.queryByText('Happening Now')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('postPageHighlightWidget'),
    ).not.toBeInTheDocument();
  });

  it('points "Read all" to /highlights with the first highlight id', async () => {
    mockGqlRequest.mockResolvedValue(
      buildResponse([buildHighlight('first', 'First headline')]),
    );

    renderWidget();

    const readAll = await screen.findByLabelText('Read all highlights');
    expect(readAll).toHaveAttribute('href', '/highlights?highlight=first');
  });

  it('rotates headlines after the interval', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
    mockGqlRequest.mockResolvedValue(
      buildResponse([
        buildHighlight('h1', 'The first highlight'),
        buildHighlight('h2', 'The second highlight'),
      ]),
    );

    renderWidget();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByText('The first highlight')).toBeInTheDocument(),
    );

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.queryByText('The first highlight')).not.toBeInTheDocument();
  });

  it('pauses rotation while hovering', async () => {
    mockGqlRequest.mockResolvedValue(
      buildResponse([
        buildHighlight('h1', 'The first highlight'),
        buildHighlight('h2', 'The second highlight'),
      ]),
    );

    renderWidget();
    const article = await screen.findByTestId('postPageHighlightWidget');
    expect(screen.getByText('The first highlight')).toBeInTheDocument();

    await userEvent.hover(article);

    jest.useFakeTimers();
    await act(async () => {
      jest.advanceTimersByTime(6000);
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.queryByText('The second highlight')).not.toBeInTheDocument();
  });
});
