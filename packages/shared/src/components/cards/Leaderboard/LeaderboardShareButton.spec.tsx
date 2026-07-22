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
import { LeaderboardShareButton } from './LeaderboardShareButton';
import { LeaderboardListContainer } from './LeaderboardListContainer';
import { LeaderboardType } from '../../../graphql/leaderboard';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useLeaderboardShareEnabled } from '../../../hooks/leaderboard/useLeaderboardShareEnabled';
import { useViewSize } from '../../../hooks/useViewSize';
import { getShortLinkProps } from '../../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../../lib/referral';

// `NEXT_PUBLIC_WEBAPP_URL` is '/' under jest, but the referral tracker builds a
// `new URL(...)` and needs the absolute origin production actually ships.
jest.mock('../../../lib/constants', () => ({
  ...jest.requireActual('../../../lib/constants'),
  webappUrl: 'https://app.daily.dev/',
}));

jest.mock('../../../hooks/leaderboard/useLeaderboardShareEnabled', () => ({
  useLeaderboardShareEnabled: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const shareEnabledMock = useLeaderboardShareEnabled as jest.Mock;
const viewSizeMock = useViewSize as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);

const link = 'https://app.daily.dev/users/longestStreak';
const shortLink = 'https://dly.to/board';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  shareEnabledMock.mockReturnValue(true);
  viewSizeMock.mockReturnValue(true); // laptop
  Object.assign(navigator, { clipboard: { writeText } });

  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { queryKey } = getShortLinkProps(
    link,
    ReferralCampaignKey.Generic,
    loggedUser,
  );
  client.setQueryData(queryKey, shortLink);
});

const renderButton = (): RenderResult =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <LeaderboardShareButton type={LeaderboardType.LongestStreak} />
    </TestBootProvider>,
  );

describe('LeaderboardShareButton', () => {
  it('renders a labelled trigger naming the leaderboard', () => {
    renderButton();

    expect(
      screen.getByLabelText('Share the longest streak leaderboard'),
    ).toBeInTheDocument();
  });

  it('copies the leaderboard permalink', async () => {
    renderButton();

    await act(async () => {
      fireEvent.click(
        screen.getByLabelText('Share the longest streak leaderboard'),
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortLink));
  });

  it('renders nothing when the flag is off', () => {
    shareEnabledMock.mockReturnValue(false);
    const { container } = renderButton();

    expect(container).toBeEmptyDOMElement();
  });
});

const renderContainer = (titleAction?: React.ReactNode): RenderResult =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <LeaderboardListContainer
        title="Longest streak"
        titleHref="/users/longestStreak"
        titleAction={titleAction}
      >
        <li>row</li>
      </LeaderboardListContainer>
    </TestBootProvider>,
  );

describe('LeaderboardListContainer title action', () => {
  it('keeps the plain heading markup when no title action is passed', () => {
    renderContainer();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('mb-2');
    // No wrapper is inserted: the heading still sits directly above the list.
    expect(heading.nextElementSibling?.tagName).toBe('OL');
  });

  it('lays the heading and the action out in one row when passed', () => {
    renderContainer(
      <LeaderboardShareButton type={LeaderboardType.LongestStreak} />,
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).not.toHaveClass('mb-2');
    expect(heading.parentElement).toHaveClass('justify-between');
    expect(
      screen.getByLabelText('Share the longest streak leaderboard'),
    ).toBeInTheDocument();
  });
});
