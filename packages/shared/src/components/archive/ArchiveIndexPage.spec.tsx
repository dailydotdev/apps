import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { ArchiveIndexPage } from './ArchiveIndexPage';
import type { Archive } from '../../graphql/archive';
import {
  ArchivePeriodType,
  ArchiveRankingType,
  ArchiveScopeType,
  ArchiveSubjectType,
} from '../../graphql/archive';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

const archive: Archive = {
  id: 'a1',
  subjectType: ArchiveSubjectType.Post,
  rankingType: ArchiveRankingType.Best,
  scopeType: ArchiveScopeType.Global,
  scopeId: null,
  periodType: ArchivePeriodType.Month,
  periodStart: '2026-05-01T00:00:00.000Z',
  items: [],
};

const gbWithFeatures = (features: Record<string, boolean>): GrowthBook =>
  new GrowthBook({
    features: Object.fromEntries(
      Object.entries(features).map(([id, value]) => [
        id,
        { defaultValue: value },
      ]),
    ),
  });

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

const renderComponent = (gb?: GrowthBook): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client} gb={gb} log={{ logEvent }}>
      <ArchiveIndexPage
        archives={[archive]}
        scopeType={ArchiveScopeType.Global}
        scopeName="daily.dev"
      />
    </TestBootProvider>,
  );
};

it('keeps the original heading and renders no share control when flags are off', () => {
  renderComponent();

  expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveClass('mx-4 font-bold typo-title2 tablet:typo-title1', {
    exact: true,
  });
});

it('copies the canonical archive index url and logs when flags are on', async () => {
  renderComponent(
    gbWithFeatures({ sharing_visibility: true, share_discovery: true }),
  );

  const controls = screen.getAllByLabelText('Copy link');
  expect(controls).toHaveLength(1);

  await act(async () => {
    fireEvent.click(controls[0]);
  });

  // webappUrl is '/' under Jest, so the canonical link is the bare path
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('/posts/best-of'));
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareLog,
    target_id: '/posts/best-of',
    extra: JSON.stringify({
      origin: Origin.BestOfArchive,
      provider: ShareProvider.CopyLink,
    }),
  });
});
