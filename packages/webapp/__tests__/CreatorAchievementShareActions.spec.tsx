import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { defaultQueryClientTestingConfig } from '@dailydotdev/shared/__tests__/helpers/tanstack-query';
import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  CreatorAchievementType,
  SHARE_CREATOR_ACHIEVEMENT_MUTATION,
  UNSHARE_CREATOR_ACHIEVEMENT_MUTATION,
} from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { CreatorAchievementShareActions } from '../components/analytics/creator/CreatorAchievementShareActions';

const shareUrl = 'http://localhost:5002/achievements/ca1';

const achievement = (
  partial: Partial<CreatorAchievement> = {},
): CreatorAchievement => ({
  id: 'ca1',
  type: CreatorAchievementType.CreatorImpressionMilestone,
  achievedAt: '2026-09-01T12:00:00.000Z',
  post: null,
  keyword: null,
  periodStart: null,
  periodEnd: null,
  threshold: 100000,
  rank: null,
  measuredValue: 104321,
  evidenceUrl: null,
  isHistorical: false,
  shareUrl: null,
  ...partial,
});

const logEvent = jest.fn();
const writeText = jest.fn();

const renderActions = (props: Partial<CreatorAchievement> = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
      auth={{ user: defaultUser }}
      log={{ logEvent }}
    >
      <CreatorAchievementShareActions achievement={achievement(props)} />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  writeText.mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
});

it('should share a private achievement before copying its link', async () => {
  mockGraphQL({
    request: {
      query: SHARE_CREATOR_ACHIEVEMENT_MUTATION,
      variables: { id: 'ca1' },
    },
    result: { data: { shareCreatorAchievement: { id: 'ca1', shareUrl } } },
  });
  renderActions();

  expect(
    screen.getByText(/Sharing makes this achievement visible/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(shareUrl));
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareCreatorAchievement,
      target_id: 'ca1',
      extra: JSON.stringify({
        provider: ShareProvider.CopyLink,
        type: CreatorAchievementType.CreatorImpressionMilestone,
      }),
    }),
  );
  expect(
    await screen.findByText('Anyone with the link can see this achievement.'),
  ).toBeInTheDocument();
});

it('should copy the existing link without sharing again', async () => {
  renderActions({ shareUrl });

  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  // No mutation is mocked, so a second share request would fail the copy.
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(shareUrl));
});

it('should not log a share the browser refused to copy', async () => {
  writeText.mockRejectedValue(new Error('denied'));
  renderActions({ shareUrl });

  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  await waitFor(() => expect(writeText).toHaveBeenCalled());
  expect(logEvent).not.toHaveBeenCalled();
});

it('should take a shared achievement private again', async () => {
  mockGraphQL({
    request: {
      query: UNSHARE_CREATOR_ACHIEVEMENT_MUTATION,
      variables: { id: 'ca1' },
    },
    result: { data: { unshareCreatorAchievement: { _: true } } },
  });
  renderActions({ shareUrl });

  fireEvent.click(screen.getByRole('button', { name: 'Stop sharing' }));

  expect(
    await screen.findByText(/Sharing makes this achievement visible/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Stop sharing' }),
  ).not.toBeInTheDocument();
});
