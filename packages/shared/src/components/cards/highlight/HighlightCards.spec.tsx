import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';
import { HighlightGrid } from './HighlightGrid';
import { HighlightList } from './HighlightList';

jest.mock('../../../lib/constants', () => ({
  webappUrl: '/',
}));

const highlights = [
  {
    id: 'highlight-1',
    channel: 'agents',
    headline: 'The first highlight',
    highlightedAt: '2026-04-05T09:00:00.000Z',
    post: {
      id: 'post-1',
      commentsPermalink: '/posts/post-1',
    },
  },
  {
    id: 'highlight-2',
    channel: 'agents',
    headline: 'The second highlight',
    highlightedAt: '2026-04-05T08:00:00.000Z',
    post: {
      id: 'post-2',
      commentsPermalink: '/posts/post-2',
    },
  },
];

const renderCard = (card: ReactElement, logEvent = jest.fn()) =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      {card}
    </TestBootProvider>,
  );

describe('Highlight cards', () => {
  it('should render the grid card with highlight links', () => {
    renderCard(<HighlightGrid highlights={highlights} />);

    expect(screen.getByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /the first highlight/i }),
    ).toHaveAttribute('href', '/highlights?highlight=highlight-1');
    expect(screen.getByLabelText('Read all highlights')).toHaveAttribute(
      'href',
      '/highlights?highlight=highlight-1',
    );
    expect(screen.getByText('The first highlight')).not.toHaveClass(
      'line-clamp-2',
    );
    expect(
      screen.getByRole('link', { name: /the first highlight/i }).parentElement,
    ).toHaveClass('no-scrollbar', 'overflow-y-auto');
  });

  it('should render the list card with highlight links', () => {
    renderCard(<HighlightList highlights={highlights} />);

    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });

  it('should trigger the highlight callbacks without blocking navigation', async () => {
    const onHighlightClick = jest.fn();
    const onReadAllClick = jest.fn();

    renderCard(
      <HighlightGrid
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
      />,
    );

    await userEvent.click(
      screen.getByRole('link', { name: /the first highlight/i }),
    );
    await userEvent.click(screen.getByLabelText('Read all highlights'));

    expect(onHighlightClick).toHaveBeenCalledWith(highlights[0], 1);
    expect(onReadAllClick).toHaveBeenCalledTimes(1);
  });
});

describe('Highlight card share controls', () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  const renderShareable = (logEvent: jest.Mock, onHighlightClick?: jest.Mock) =>
    renderCard(
      <HighlightGrid
        highlights={highlights}
        onHighlightClick={onHighlightClick}
      />,
      logEvent,
    );

  it('copies a highlight from its row without opening it', async () => {
    const logEvent = jest.fn();
    const onHighlightClick = jest.fn();
    renderShareable(logEvent, onHighlightClick);
    // The header's page link comes first, then one per row.
    const [, firstRow] = screen.getAllByRole('button', { name: 'Copy link' });

    await act(async () => {
      fireEvent.click(firstRow);
    });

    expect(onHighlightClick).not.toHaveBeenCalled();
    const [[event]] = logEvent.mock.calls;
    expect(event).toMatchObject({
      event_name: LogEvent.SharePost,
      target_id: 'post-1',
      target_type: TargetType.Post,
    });
    expect(JSON.parse(event.extra)).toEqual({
      provider: ShareProvider.CopyLink,
      origin: Origin.HighlightsCard,
      highlight_id: 'highlight-1',
    });
  });

  it('logs the header link as a share of the page', async () => {
    const logEvent = jest.fn();
    renderShareable(logEvent);
    const [header] = screen.getAllByRole('button', { name: 'Copy link' });

    await act(async () => {
      fireEvent.click(header);
    });

    const [[event]] = logEvent.mock.calls;
    expect(event.event_name).toBe(LogEvent.ShareHighlights);
    expect(event.target_id).toBeUndefined();
    expect(JSON.parse(event.extra)).toEqual({
      provider: ShareProvider.CopyLink,
      origin: Origin.HighlightsCard,
    });
  });
});
