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
import { ArchiveFeedPage } from './ArchiveFeedPage';
import { ArchivePeriodType, ArchiveScopeType } from '../../graphql/archive';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

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
      <ArchiveFeedPage
        archive={null}
        scopeType={ArchiveScopeType.Tag}
        scopeId="react"
        scopeName="react"
        periodType={ArchivePeriodType.Month}
        year={2026}
        month={5}
      />
    </TestBootProvider>,
  );
};

it('keeps the original heading and renders no share control when flags are off', () => {
  renderComponent();

  expect(screen.queryByLabelText('Share this archive')).not.toBeInTheDocument();
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveClass('mx-4 font-bold typo-title2 tablet:typo-title1', {
    exact: true,
  });
});

it('copies the canonical archive page url and logs when flags are on', async () => {
  renderComponent(
    gbWithFeatures({ sharing_visibility: true, share_discovery: true }),
  );

  const controls = screen.getAllByLabelText('Share this archive');
  expect(controls).toHaveLength(1);

  await act(async () => {
    fireEvent.click(controls[0]);
  });

  // webappUrl is '/' under Jest, so the canonical link is the bare path
  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith('/tags/react/best-of/2026/05'),
  );
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareLog,
    target_id: '/tags/react/best-of/2026/05',
    extra: JSON.stringify({
      origin: Origin.BestOfArchive,
      provider: ShareProvider.CopyLink,
    }),
  });
});
