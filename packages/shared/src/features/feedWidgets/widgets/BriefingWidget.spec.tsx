import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { briefContentHtml } from '../../../../__tests__/fixture/brief';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import type { LatestBriefing } from '../../../graphql/posts';
import { LATEST_BRIEFING_QUERY } from '../../../graphql/posts';
import { LogEvent } from '../../../lib/log';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { BriefingWidget } from './BriefingWidget';

const brief: LatestBriefing = {
  id: 'brief-1',
  slug: 'oct-21-2026-brief-1',
  title: 'Oct 21, 2026',
  summary: 'Shopify has acquired Tailwind CSS.',
  contentHtml: briefContentHtml,
  readTime: 4,
  createdAt: '2026-10-21T06:00:00.000Z',
  read: false,
  flags: { posts: 120, sources: 30 },
};

const mockBriefing = (latest: LatestBriefing | null) =>
  mockGraphQL({
    request: { query: LATEST_BRIEFING_QUERY },
    result: {
      data: {
        briefingPosts: { edges: latest ? [{ node: latest }] : [] },
      },
    },
  });

const logEvent = jest.fn();

const renderWidget = (size = FeedWidgetSize.Tall) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <BriefingWidget
        widget={{ id: 'w', kind: FeedWidgetKind.Briefing, size }}
        size={size}
        isEditing={false}
        onConfigChange={() => false}
        canConfigure={false}
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

it('shows the latest brief with its Must know claims, linking to the brief', async () => {
  mockBriefing(brief);
  renderWidget();

  const link = await screen.findByRole('link', { name: /Oct 21, 2026/ });
  expect(link).toHaveAttribute(
    'href',
    expect.stringMatching(/posts\/oct-21-2026-brief-1$/),
  );
  expect(screen.getByText(brief.summary as string)).toBeInTheDocument();
  expect(screen.getByText('Just in')).toBeInTheDocument();
  expect(
    screen.getAllByRole('listitem').map((item) => item.textContent),
  ).toEqual([
    'US intelligence labels Chinese AI distillation a national security threat',
    'Shopify acquires Tailwind Labs to anchor the CSS framework',
    'Microsoft and Cisco hit by record AI discovered vulnerabilities',
  ]);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.ImpressionBrief }),
  );

  fireEvent.click(link);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.ClickBrief }),
  );
});

it('keeps the Small tile to the date and summary', async () => {
  mockBriefing({ ...brief, read: true });
  renderWidget(FeedWidgetSize.Small);

  expect(await screen.findByText(brief.summary as string)).toBeInTheDocument();
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  expect(screen.queryByText('Just in')).not.toBeInTheDocument();
});

it('points to the briefing page when there is no brief yet', async () => {
  mockBriefing(null);
  renderWidget();

  const link = await screen.findByRole('link', { name: /No briefing yet/ });
  expect(link).toHaveAttribute('href', expect.stringMatching(/briefing$/));
  expect(logEvent).not.toHaveBeenCalled();
});
