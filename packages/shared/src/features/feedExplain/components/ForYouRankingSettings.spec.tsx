import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import type { FeedControls, FeedProfile } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { SET_FEED_RANKING_SETTING_MUTATION } from '../graphql';
import { ForYouRankingSettings } from './ForYouRankingSettings';

const profile: FeedProfile = {
  cohort: true,
  learning: true,
  interests: [],
  muted: [],
  blocked: [],
  ranking: [{ key: 'age.half_life_days', value: 7, defaultValue: 7 }],
};

const renderRanking = ({
  isPlus,
  ranking = [],
}: {
  isPlus: boolean;
  ranking?: FeedControls['ranking'];
}) => {
  const user = { ...defaultUser, isPlus };
  const client = new QueryClient();
  client.setQueryData(feedProfileQueryKey(user, 116), profile);
  client.setQueryData<FeedControls>(feedControlsQueryKey(user), {
    topics: [],
    sources: [],
    learning: true,
    fillIns: true,
    ranking,
  });

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <ForYouRankingSettings version={116} />
    </TestBootProvider>,
  );
};

const mockSetting = (value: number | null) => {
  let sent = false;
  mockGraphQL({
    request: {
      query: SET_FEED_RANKING_SETTING_MUTATION,
      variables: { key: 'age.half_life_days', value },
    },
    result: () => {
      sent = true;
      return { data: { setFeedRankingSetting: { _: true } } };
    },
  });
  return () => sent;
};

beforeEach(() => {
  nock.cleanAll();
});

describe('ForYouRankingSettings', () => {
  it("should show a free reader the feed's values locked, keeping their own for Plus", async () => {
    renderRanking({
      isPlus: false,
      ranking: [{ key: 'age.half_life_days', value: 10 }],
    });

    const slider = await screen.findByRole('slider', {
      name: 'A post counts half as much after',
    });
    expect(slider).toHaveAttribute('data-disabled');
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(
      screen.getByText('Your change is saved and counts again with Plus.'),
    ).toBeInTheDocument();
  });

  it("should save a Plus reader's change once they let go", async () => {
    const isSent = mockSetting(8);
    renderRanking({ isPlus: true });

    fireEvent.keyDown(
      await screen.findByRole('slider', {
        name: 'A post counts half as much after',
      }),
      { key: 'ArrowRight' },
    );

    await waitFor(() => expect(isSent()).toBe(true));
  });

  it('should take a changed setting back to the default', async () => {
    const isSent = mockSetting(null);
    renderRanking({
      isPlus: true,
      ranking: [{ key: 'age.half_life_days', value: 10 }],
    });

    await userEvent.click(await screen.findByText('Reset to 7 days'));

    await waitFor(() => expect(isSent()).toBe(true));
  });
});
