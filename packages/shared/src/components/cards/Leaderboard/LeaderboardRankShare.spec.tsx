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
import { LeaderboardRankShare } from './LeaderboardRankShare';
import type { LeaderboardPosition } from '../../../graphql/leaderboard';
import { LeaderboardType } from '../../../graphql/leaderboard';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useLeaderboardShareEnabled } from '../../../hooks/leaderboard/useLeaderboardShareEnabled';
import { useLeaderboardPosition } from '../../../hooks/leaderboard/useLeaderboardPosition';
import { useViewSize } from '../../../hooks/useViewSize';
import { getShortLinkProps } from '../../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../../lib/referral';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import type { ToastNotification } from '../../../hooks/useToastNotification';

// `NEXT_PUBLIC_WEBAPP_URL` is '/' under jest, but the referral tracker builds a
// `new URL(...)` and needs the absolute origin production actually ships.
jest.mock('../../../lib/constants', () => ({
  ...jest.requireActual('../../../lib/constants'),
  webappUrl: 'https://app.daily.dev/',
}));

jest.mock('../../../hooks/leaderboard/useLeaderboardShareEnabled', () => ({
  useLeaderboardShareEnabled: jest.fn(),
}));

jest.mock('../../../hooks/leaderboard/useLeaderboardPosition', () => ({
  useLeaderboardPosition: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const shareEnabledMock = useLeaderboardShareEnabled as jest.Mock;
const positionMock = useLeaderboardPosition as jest.Mock;
const viewSizeMock = useViewSize as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);

const link = 'https://app.daily.dev/users/longestStreak';
const shortLink = 'https://dly.to/rank12';

const mockPosition = (
  position: LeaderboardPosition | null,
  isPending = false,
) => positionMock.mockReturnValue({ position, isPending });

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  shareEnabledMock.mockReturnValue(true);
  viewSizeMock.mockReturnValue(true); // laptop
  mockPosition({ rank: 12, score: 340, cappedAt: 5000 });
  Object.assign(navigator, { clipboard: { writeText } });

  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Pre-seed the short-URL cache so the copy path never hits the network.
  const { queryKey } = getShortLinkProps(
    link,
    ReferralCampaignKey.Generic,
    loggedUser,
  );
  client.setQueryData(queryKey, shortLink);
});

afterEach(() => {
  delete (navigator as unknown as { share?: unknown }).share;
  globalThis.localStorage.removeItem('mobile');
});

const renderComponent = (type = LeaderboardType.LongestStreak): RenderResult =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <LeaderboardRankShare type={type} />
    </TestBootProvider>,
  );

describe('LeaderboardRankShare', () => {
  it('renders the rank headline and the pre-filled share text', () => {
    renderComponent();

    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(
      screen.getByText(
        "I'm #12 on the daily.dev longest streak leaderboard. Still climbing.",
      ),
    ).toBeInTheDocument();
  });

  it('uses the top-tier copy for a top three rank', () => {
    mockPosition({ rank: 2, score: 900, cappedAt: 5000 });
    renderComponent();

    expect(
      screen.getByText(
        "Somehow I'm #2 on the daily.dev longest streak leaderboard. Come take the spot.",
      ),
    ).toBeInTheDocument();
  });

  it('renders nothing while the position is still loading', () => {
    mockPosition(null, true);
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the viewer sits past the ranked cap', () => {
    mockPosition({ rank: null, score: 3, cappedAt: 5000 });
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/#undefined|#null/)).not.toBeInTheDocument();
  });

  it('renders nothing when the API returns no position at all', () => {
    mockPosition(null);
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a leaderboard without position support', () => {
    const { container } = renderComponent(LeaderboardType.MostUpvoted);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the flag is off', () => {
    shareEnabledMock.mockReturnValue(false);
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('copies the tracked link and shows a toast on desktop', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share your rank'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortLink));
    await waitFor(() =>
      expect(
        (client.getQueryData(TOAST_NOTIF_KEY) as ToastNotification)?.message,
      ).toEqual('✅ Copied link to clipboard'),
    );
  });

  it('opens the native share sheet with the rank text on mobile', async () => {
    viewSizeMock.mockReturnValue(false);
    globalThis.localStorage.setItem('mobile', 'true');
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share your rank'));
    });

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).toContain(
      "I'm #12 on the daily.dev longest streak leaderboard",
    );
    expect(share.mock.calls[0][0].text).toContain(shortLink);
  });
});
